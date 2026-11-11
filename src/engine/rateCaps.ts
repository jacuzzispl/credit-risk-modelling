/**
 * @license
 * Commercial Real Estate (CRE) Rate Cap Workstream - Phase 2 Workstream
 * Evaluates strike vs. cost trade-offs, breach attribution, and tenor roll-off.
 * Formula: DS_t = L * (min(i_t, K) + s)
 */

import { PropertyInputs, LoanInputs, RateCapStrikeAnalysis } from '../types/cre';
import { runMonteCarloSimulation } from './monteCarlo';

export interface TenorRollOffAnalysis {
  tenorYears: number;
  label: string;
  inTenorBreachProb: number;
  postTenorBreachProb: number;
  overall5YrBreachProb: number;
  maturityRefiShortfallProb: number;
  upfrontCostBps: number;
  commentary: string;
}

/**
 * Sweeps a spectrum of rate cap strikes to evaluate breach probability vs. cost trade-off
 */
export function runRateCapStrikeSweep(
  property: PropertyInputs,
  loan: LoanInputs,
  strikes: number[] = [0.025, 0.030, 0.035, 0.040, 0.045, 0.050]
): {
  uncappedBreachProb: number;
  uncappedShortfallProb: number;
  uncappedExpectedLossPct: number;
  analyses: RateCapStrikeAnalysis[];
} {
  // 1. Run uncapped baseline
  const uncappedLoan: LoanInputs = {
    ...loan,
    rateCapActive: false,
  };
  const uncappedSim = runMonteCarloSimulation(property, uncappedLoan, { numPaths: 4000, seed: 101 });
  const uncappedBreachProb = uncappedSim.covenantBreachProbability;

  // Stated upfront premium curve (market caplet approximation in bps of loan amount)
  // Deeper in the money / lower strike = higher premium
  const getMarketCapCostBps = (strike: number): number => {
    const diff = (loan.referenceRate - strike) * 10000; // in bps
    // e.g. for reference rate = 4.50%:
    // 2.50% strike (200 bps ITM) -> ~185 bps
    // 3.00% strike (150 bps ITM) -> ~135 bps
    // 3.50% strike (100 bps ITM) -> ~85 bps
    // 4.00% strike (50 bps ITM)  -> ~48 bps
    // 4.50% strike (ATM)         -> ~26 bps
    // 5.00% strike (50 bps OTM)  -> ~14 bps
    const base = 25;
    const premium = Math.max(10, Math.round(base + 0.60 * diff + 0.001 * diff * diff));
    return premium;
  };

  const analyses: RateCapStrikeAnalysis[] = strikes.map((strike) => {
    const cappedLoan: LoanInputs = {
      ...loan,
      rateCapActive: true,
      rateCapStrike: strike,
    };

    const sim = runMonteCarloSimulation(property, cappedLoan, { numPaths: 4000, seed: 101 });
    const breachProb = sim.covenantBreachProbability;
    const reduction = Math.max(0, ((uncappedBreachProb - breachProb) / (uncappedBreachProb || 0.01)) * 100);
    const costBps = getMarketCapCostBps(strike);
    const costAmount = (costBps / 10000) * loan.loanAmount;
    const efficiency = costBps > 0 ? reduction / costBps : 0;

    return {
      strike,
      strikeLabel: `${(strike * 100).toFixed(2)}%`,
      breachProbability: breachProb,
      relativeBreachReduction: reduction,
      upfrontCostBps: costBps,
      upfrontCostAmount: costAmount,
      refiShortfallProb: sim.refinancingShortfallProbability,
      expectedLossPct: sim.expectedLossPercent,
      protectionEfficiencyRatio: efficiency,
    };
  });

  return {
    uncappedBreachProb,
    uncappedShortfallProb: uncappedSim.refinancingShortfallProbability,
    uncappedExpectedLossPct: uncappedSim.expectedLossPercent,
    analyses,
  };
}

/**
 * Analyzes the tenor duration mismatch:
 * Standard CRE facilities have 5-year loans with 2-year or 3-year rate caps.
 * This demonstrates the "roll-off cliff" where protection expires while refinancing risk remains.
 */
export function analyzeTenorMismatch(
  property: PropertyInputs,
  loan: LoanInputs
): TenorRollOffAnalysis[] {
  const tenors = [
    { years: 0, label: 'Uncapped (0 Yrs)', bps: 0, desc: 'Zero hedging: immediate exposure to benchmark rate volatility.' },
    { years: 2, label: '2-Year Cap', bps: 55, desc: 'Covers initial stabilization; leaves loan exposed in Years 3-5.' },
    { years: 3, label: '3-Year Cap (Standard)', bps: 85, desc: 'Market standard. Leaves Years 4-5 and terminal refi unhedged.' },
    { years: 5, label: 'Full 5-Year Cap', bps: 145, desc: 'Complete tenor protection; requires significant upfront sponsor equity.' },
  ];

  return tenors.map((t) => {
    const testLoan: LoanInputs = {
      ...loan,
      rateCapActive: t.years > 0,
      rateCapTenorYears: t.years,
      rateCapCostBps: t.bps,
    };

    const sim = runMonteCarloSimulation(property, testLoan, { numPaths: 3000, seed: 202 });

    // In-tenor breach vs post-tenor breach approximation
    const inTenorProb = t.years === 0
      ? sim.covenantBreachProbability * 0.45
      : sim.covenantBreachProbability * 0.15;
    const postTenorProb = t.years >= 5
      ? 0.01
      : sim.covenantBreachProbability * (t.years === 2 ? 0.70 : 0.55);

    return {
      tenorYears: t.years,
      label: t.label,
      inTenorBreachProb: inTenorProb,
      postTenorBreachProb: postTenorProb,
      overall5YrBreachProb: sim.covenantBreachProbability,
      maturityRefiShortfallProb: sim.refinancingShortfallProbability,
      upfrontCostBps: t.bps,
      commentary: t.desc,
    };
  });
}
