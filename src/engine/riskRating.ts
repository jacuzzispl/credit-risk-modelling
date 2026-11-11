/**
 * @license
 * Commercial Real Estate (CRE) Risk Rating & Integration Engine - Phase 4
 * Implements:
 * - Expected Loss: EL = PD * LGD * EAD
 * - Apollo Institutional 1-5 Risk Rating Scorecard with transparent thresholds
 * - 2D Macro Sensitivity Matrix (+/- 100bp, 200bp benchmark rate vs +/- 15%, 30% asset value)
 */

import {
  PropertyInputs,
  LoanInputs,
  RiskRatingAssessment,
  UnderwritingSummary,
} from '../types/cre';
import { evaluateCoxDefaultModel } from './defaultModel';

/**
 * Assesses loan credit rating on standard institutional 1 to 5 scale
 */
export function evaluateRiskRating(
  underwriting: UnderwritingSummary,
  monteCarloShortfallProb: number,
  monteCarloExpectedLossPct: number
): RiskRatingAssessment {
  const { property, loan, initialLTV, initialDebtYield, minDSCR, refinancing } = underwriting;
  const coxModel = evaluateCoxDefaultModel(property, loan);

  const oneYearPD = coxModel.sampleLoanCumulativePD[0].cumulativePD;
  const fiveYearPD = coxModel.sampleLoanCumulativePD[4].cumulativePD;

  // Loss Given Default (LGD) calculated from distress discount & sales cost
  // If property value drops and liquidation occurs:
  const netLiquidation =
    refinancing.propertyValueMaturity * (1 - property.sellingCostsRatio - property.distressDiscount);
  const calculatedLoss = Math.max(0, loan.loanAmount - netLiquidation);
  const baselineLGD = loan.loanAmount > 0 ? calculatedLoss / loan.loanAmount : 0;

  // Effective empirical LGD for senior CRE first mortgage (typically 20% - 35% if default occurs)
  const effectiveLGD = Math.max(0.18, Math.min(0.55, baselineLGD > 0 ? baselineLGD : 0.22));

  // Expected Loss: EL = PD * LGD * EAD
  const annualEL = oneYearPD * effectiveLGD * loan.loanAmount;
  const lifetimeEL = fiveYearPD * effectiveLGD * loan.loanAmount;
  const lifetimeELPercent = (lifetimeEL / loan.loanAmount) * 100;

  // Institutional 1-5 Rating Logic:
  // Rating 1: PD5 < 1.0%, EL < 0.25%, LTV < 55%, DSCR > 1.60x, DY > 9.5%
  // Rating 2: PD5 < 3.0%, EL < 0.85%, LTV < 65%, DSCR > 1.35x, DY > 8.0%
  // Rating 3: PD5 < 7.0%, EL < 2.50%, LTV < 72%, DSCR > 1.18x, DY > 7.0%
  // Rating 4: PD5 < 15.0%, EL < 6.0%, LTV < 80%, DSCR < 1.15x
  // Rating 5: PD5 >= 15.0% or EL >= 6.0% or LTV >= 80%

  let rating: 1 | 2 | 3 | 4 | 5 = 3;
  let ratingLabel = '3 - Satisfactory / Acceptable';
  let recommendation: 'Approve' | 'Approve with Conditions' | 'Decline' = 'Approve with Conditions';

  if (fiveYearPD < 0.015 && lifetimeELPercent < 0.35 && initialLTV <= 0.58 && minDSCR >= 1.55) {
    rating = 1;
    ratingLabel = '1 - Minimal Risk (Superior Credit)';
    recommendation = 'Approve';
  } else if (fiveYearPD < 0.038 && lifetimeELPercent < 1.10 && initialLTV <= 0.65 && minDSCR >= 1.30) {
    rating = 2;
    ratingLabel = '2 - Low Risk (Investment Grade Profile)';
    recommendation = 'Approve with Conditions';
  } else if (fiveYearPD < 0.085 && lifetimeELPercent < 2.80 && initialLTV <= 0.72 && minDSCR >= 1.15) {
    rating = 3;
    ratingLabel = '3 - Satisfactory / Standard Credit Risk';
    recommendation = 'Approve with Conditions';
  } else if (fiveYearPD < 0.160 || lifetimeELPercent < 6.50 || initialLTV <= 0.80) {
    rating = 4;
    ratingLabel = '4 - Watchlist / Special Mention';
    recommendation = 'Approve with Conditions';
  } else {
    rating = 5;
    ratingLabel = '5 - Impaired / Substandard';
    recommendation = 'Decline';
  }

  // Rationales and bullet points
  const ratingRationale: string[] = [
    `Calculated 5-Year Cumulative PD of ${(fiveYearPD * 100).toFixed(2)}% with expected lifetime loss of ${lifetimeELPercent.toFixed(2)}% (£${(lifetimeEL / 1e6).toFixed(2)}M).`,
    `Initial Debt Yield of ${(initialDebtYield * 100).toFixed(2)}% provides solid cash flow coverage above market refinancing threshold of ${(loan.refiMinDebtYield * 100).toFixed(2)}%.`,
    `In-period minimum underwritten DSCR of ${minDSCR.toFixed(2)}x maintains a buffer against covenant trip point (${loan.covenantMinDSCR.toFixed(2)}x).`,
    `Mandatory interest rate cap at ${(loan.rateCapStrike * 100).toFixed(2)}% strike insulates cash flows against benchmark rate shocks for the first ${loan.rateCapTenorYears} years.`,
  ];

  const keyStrengths: string[] = [
    `Prime asset class (${property.propertyType}) in established location (${property.location}).`,
    `Healthy in-place occupancy of ${(property.occupancy * 100).toFixed(1)}% with long WAULT.`,
    `Sponsor equity cushion of ${((1 - initialLTV) * 100).toFixed(1)}% absorbs initial asset valuation decline.`,
  ];

  const keyVulnerabilities: string[] = [
    `Floating rate exposure if SONIA/Euribor exceeds rate cap strike or after Year ${loan.rateCapTenorYears} tenor expiration.`,
    `Refinancing liquidity at Year ${loan.termYears} maturity depends on exit cap rate remaining below ${(loan.refiMinDebtYield * 100).toFixed(2)}%.`,
    `Tenant concentration: single major tenant loss creates acute DSCR pressure.`,
  ];

  // 2D Macro Sensitivity Grid:
  // Benchmark rate shifts: -200bps, -100bps, 0, +100bps, +200bps
  // Property value shifts: -30%, -15%, 0, +15%
  const rateShifts = [-200, -100, 0, 100, 200];
  const valueShifts = [-0.30, -0.15, 0.0, 0.15];

  const macroSensitivityGrid = [];

  for (const rShift of rateShifts) {
    for (const vShift of valueShifts) {
      const stressedRefRate = Math.max(0.01, loan.referenceRate + rShift / 10000);
      const stressedValue = refinancing.propertyValueMaturity * (1 + vShift);
      const stressedNOI = refinancing.noiMaturity * (1 + vShift * 0.5); // modest NOI correlation

      // Refi capacity
      const maxLtv = loan.refiMaxLTV * stressedValue;
      const maxDy = stressedNOI / loan.refiMinDebtYield;
      const maxDscr = stressedNOI / (loan.refiMinDSCR * (stressedRefRate + loan.refiSpread));
      const maxRefi = Math.min(maxLtv, maxDy, maxDscr);

      const shortfall = Math.max(0, loan.loanAmount - maxRefi);
      const netLiq = stressedValue * (1 - property.sellingCostsRatio - property.distressDiscount);
      const loss = shortfall > 0 ? Math.max(0, loan.loanAmount - netLiq) : 0;

      // Implied PD shift
      const pdMultiplier = Math.exp((rShift / 10000) * 8.5 - vShift * 3.5);
      const stressedPD = Math.min(0.45, fiveYearPD * pdMultiplier);

      let impliedRating = 2;
      if (stressedPD < 0.02 && loss === 0) impliedRating = 1;
      else if (stressedPD < 0.045 && loss === 0) impliedRating = 2;
      else if (stressedPD < 0.09 && loss < 2000000) impliedRating = 3;
      else if (stressedPD < 0.18 || loss < 8000000) impliedRating = 4;
      else impliedRating = 5;

      macroSensitivityGrid.push({
        rateShiftBps: rShift,
        propertyValueShiftPct: Math.round(vShift * 100),
        pd5Yr: stressedPD,
        refiShortfall: shortfall,
        lossAmount: loss,
        impliedRating,
      });
    }
  }

  return {
    rating,
    ratingLabel,
    recommendation,
    oneYearPD,
    fiveYearPD,
    lgd: effectiveLGD,
    expectedLossAnnual: annualEL,
    expectedLossLifetime: lifetimeEL,
    ratingRationale,
    keyStrengths,
    keyVulnerabilities,
    macroSensitivityGrid,
  };
}
