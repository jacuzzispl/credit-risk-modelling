/**
 * @license
 * Commercial Real Estate (CRE) Underwriting Engine - Phase 1
 * Pure mathematical functions, strictly typed, deterministic to the cent.
 * Follows exact formulations specified in credit plan.
 */

import {
  PropertyInputs,
  LoanInputs,
  CashFlowPeriod,
  RefinancingResult,
  UnderwritingSummary,
} from '../types/cre';

/**
 * Computes initial property valuation: V = NOI / CapRate
 */
export function calculatePropertyValue(noi: number, capRate: number): number {
  if (capRate <= 0) return 0;
  return noi / capRate;
}

/**
 * Computes core credit metrics: LTV, DSCR, Debt Yield
 */
export function calculateLtv(loanAmount: number, propertyValue: number): number {
  if (propertyValue <= 0) return 0;
  return loanAmount / propertyValue;
}

export function calculateDebtYield(noi: number, loanAmount: number): number {
  if (loanAmount <= 0) return 0;
  return noi / loanAmount;
}

export function calculateDscr(noi: number, debtService: number): number {
  if (debtService <= 0) return 999.0;
  return noi / debtService;
}

/**
 * Evaluates the annual cash flow and debt service schedule over loan term.
 * Formulations:
 * DS_t = L_t * (min(i_t, K_t) + s) + PrincipalAmort_t
 * NOI_t = GrossRent_t * Occ_t * (1 - OpexRatio) - CapexReserve_t
 */
export function generateAnnualSchedule(
  property: PropertyInputs,
  loan: LoanInputs,
  annualBenchmarkRates?: number[]
): CashFlowPeriod[] {
  const schedule: CashFlowPeriod[] = [];
  let currentBalance = loan.loanAmount;

  for (let year = 1; year <= loan.termYears; year++) {
    // Benchmark reference rate for this year (defaults to loan input if not provided)
    const refRate =
      annualBenchmarkRates && annualBenchmarkRates[year - 1] !== undefined
        ? annualBenchmarkRates[year - 1]
        : loan.referenceRate;

    // Check if rate cap is in force for this period
    const isCapInForce = loan.rateCapActive && year <= loan.rateCapTenorYears;
    const effectiveBenchmark = isCapInForce
      ? Math.min(refRate, loan.rateCapStrike)
      : refRate;

    const totalInterestRate = effectiveBenchmark + loan.marginSpread;
    const interestPayment = currentBalance * totalInterestRate;

    // Principal amortisation calculation
    let principalPayment = 0;
    if (loan.amortisationType === 'amortising_balloon') {
      principalPayment = loan.loanAmount * loan.annualAmortisationRate;
    } else if (loan.amortisationType === 'linear_amortising') {
      principalPayment = loan.loanAmount / loan.termYears;
    }

    // Ensure principal payment cannot exceed current balance
    principalPayment = Math.min(principalPayment, currentBalance);
    const totalDebtService = interestPayment + principalPayment;
    const endingBalance = currentBalance - principalPayment;

    // Property-level financials compounding with rent growth
    const growthFactor = Math.pow(1 + property.annualRentGrowth, year - 1);
    
    // In stabilized CRE modeling, base NOI escalates by rent growth
    // Gross potential rent derived to maintain target expense ratio and capex
    const grossPotentialRent =
      (property.initialNOI / (property.occupancy * (1 - property.expenseRatio))) *
      growthFactor;
    const effectiveGrossIncome = grossPotentialRent * property.occupancy;
    const operatingExpenses = effectiveGrossIncome * property.expenseRatio;
    const capexReserve = property.capexReservePerYear * growthFactor;
    const netOperatingIncome = effectiveGrossIncome - operatingExpenses - capexReserve;

    // Valuation in period t: V_t = NOI_{t+1} / kappa_t
    // For intermediate years, interpolate cap rate from entry to exit
    const capRateInterpolated =
      property.entryCapRate +
      ((property.exitCapRate - property.entryCapRate) * (year / loan.termYears));
    const nextYearNOI = netOperatingIncome * (1 + property.annualRentGrowth);
    const propertyValue = calculatePropertyValue(nextYearNOI, capRateInterpolated);

    const dscr = calculateDscr(netOperatingIncome, totalDebtService);
    const dscrBreach = dscr < loan.covenantMinDSCR;
    const inPeriodLtv = calculateLtv(endingBalance, propertyValue);
    const inPeriodDebtYield = calculateDebtYield(netOperatingIncome, endingBalance > 0 ? endingBalance : currentBalance);

    schedule.push({
      year,
      beginningBalance: currentBalance,
      referenceRate: refRate,
      marginSpread: loan.marginSpread,
      effectiveBenchmark,
      totalInterestRate,
      interestPayment,
      principalPayment,
      totalDebtService,
      endingBalance,
      grossPotentialRent,
      occupancy: property.occupancy,
      effectiveGrossIncome,
      operatingExpenses,
      capexReserve,
      netOperatingIncome,
      dscr,
      dscrBreach,
      propertyValue,
      ltv: inPeriodLtv,
      debtYield: inPeriodDebtYield,
    });

    currentBalance = endingBalance;
  }

  return schedule;
}

/**
 * Refinancing test at maturity (T).
 * Formulations from Plan:
 * L_refi^max = min( LTV_max * V_T, NOI_T / DY_min, NOI_T / (DSCR_min * (i_T + s_refi)) )
 * Shortfall = max( 0, L_T - L_refi^max )
 * Loss = max( 0, L_T - V_T * (1 - c - d) )
 */
export function evaluateRefinancingAndLoss(
  property: PropertyInputs,
  loan: LoanInputs,
  schedule: CashFlowPeriod[],
  terminalBenchmarkRate?: number,
  terminalExitCapRate?: number
): RefinancingResult {
  const lastPeriod = schedule[schedule.length - 1];
  const balanceOwed = lastPeriod.endingBalance;
  const maturityYear = loan.termYears;

  const terminalRate = terminalBenchmarkRate !== undefined ? terminalBenchmarkRate : loan.referenceRate;
  const exitCap = terminalExitCapRate !== undefined ? terminalExitCapRate : property.exitCapRate;

  // Forward NOI for terminal valuation V_T = NOI_{T+1} / exitCap
  const terminalForwardNOI = lastPeriod.netOperatingIncome * (1 + property.annualRentGrowth);
  const propertyValueMaturity = calculatePropertyValue(terminalForwardNOI, exitCap);
  const noiMaturity = lastPeriod.netOperatingIncome;

  const refiTotalRate = terminalRate + loan.refiSpread;

  // 3 Refinancing Constraint Tests:
  // 1. LTV constraint
  const maxRefiByLtv = loan.refiMaxLTV * propertyValueMaturity;

  // 2. Debt Yield constraint
  const maxRefiByDebtYield = loan.refiMinDebtYield > 0
    ? noiMaturity / loan.refiMinDebtYield
    : Infinity;

  // 3. DSCR constraint: DSCR_min * (refiTotalRate) * L <= NOI_T
  const maxRefiByDscr =
    loan.refiMinDSCR > 0 && refiTotalRate > 0
      ? noiMaturity / (loan.refiMinDSCR * refiTotalRate)
      : Infinity;

  // Binding Refinance Capacity is the minimum of all three tests
  const candidates: { type: 'LTV' | 'Debt Yield' | 'DSCR'; amount: number }[] = [
    { type: 'LTV', amount: maxRefiByLtv },
    { type: 'Debt Yield', amount: maxRefiByDebtYield },
    { type: 'DSCR', amount: maxRefiByDscr },
  ];

  candidates.sort((a, b) => a.amount - b.amount);
  const binding = candidates[0];

  const maxRefinanceableAmount = Math.max(0, binding.amount);
  const shortfall = Math.max(0, balanceOwed - maxRefinanceableAmount);
  const isShortfall = shortfall > 0.01;

  // Loss Given Default:
  // Net Liquidation Value = V_T * (1 - c - d)
  const netLiquidationValue =
    propertyValueMaturity * (1 - property.sellingCostsRatio - property.distressDiscount);

  // If there is a shortfall and borrower cannot cure, lender exercises remedy and liquidates:
  // Loss = max(0, L_T - NetLiquidationValue)
  const distressLoss = isShortfall
    ? Math.max(0, balanceOwed - netLiquidationValue)
    : 0;

  const lossSeverityPercent = balanceOwed > 0 ? (distressLoss / balanceOwed) * 100 : 0;

  return {
    maturityYear,
    balanceOwed,
    propertyValueMaturity,
    noiMaturity,
    refiReferenceRate: terminalRate,
    refiTotalRate,
    maxRefiByLtv,
    maxRefiByDebtYield,
    maxRefiByDscr,
    maxRefinanceableAmount,
    bindingConstraint: binding.type,
    shortfall,
    isShortfall,
    netLiquidationValue,
    distressLoss,
    lossSeverityPercent,
  };
}

/**
 * Runs full deterministic underwriting assessment
 */
export function runUnderwriting(
  property: PropertyInputs,
  loan: LoanInputs,
  customRates?: number[]
): UnderwritingSummary {
  const initialValue = calculatePropertyValue(property.initialNOI, property.entryCapRate);
  const initialLTV = calculateLtv(loan.loanAmount, initialValue);
  const initialDebtYield = calculateDebtYield(property.initialNOI, loan.loanAmount);

  const initialDebtService =
    loan.loanAmount * (loan.referenceRate + loan.marginSpread);
  const initialDSCR = calculateDscr(property.initialNOI, initialDebtService);

  const annualSchedule = generateAnnualSchedule(property, loan, customRates);
  const refinancing = evaluateRefinancingAndLoss(property, loan, annualSchedule);

  let minDSCR = 999;
  let maxLTV = 0;
  let totalInterestPaid = 0;
  let totalPrincipalPaid = 0;

  for (const period of annualSchedule) {
    if (period.dscr < minDSCR) minDSCR = period.dscr;
    if (period.ltv > maxLTV) maxLTV = period.ltv;
    totalInterestPaid += period.interestPayment;
    totalPrincipalPaid += period.principalPayment;
  }

  return {
    property,
    loan,
    initialValue,
    initialLTV,
    initialDebtYield,
    initialDSCR,
    annualSchedule,
    refinancing,
    minDSCR,
    maxLTV,
    totalInterestPaid,
    totalPrincipalPaid,
  };
}

/**
 * Two-way sensitivity matrix for Base Underwriting:
 * Exit Cap Rate vs NOI Decline Percentage -> Resulting Loan Loss
 */
export function generateTwoWayLossTable(
  property: PropertyInputs,
  loan: LoanInputs,
  capRateSteps: number[] = [0.045, 0.050, 0.055, 0.060, 0.065, 0.070, 0.075],
  noiChangeSteps: number[] = [0.10, 0.05, 0.0, -0.05, -0.10, -0.15, -0.20, -0.25]
): {
  capRates: number[];
  noiChanges: number[];
  matrix: {
    capRate: number;
    noiChange: number;
    terminalValue: number;
    shortfall: number;
    loss: number;
    lossSeverity: number;
  }[][];
} {
  const baseSchedule = generateAnnualSchedule(property, loan);
  const baseTerminalNOI = baseSchedule[baseSchedule.length - 1].netOperatingIncome;
  const balanceOwed = baseSchedule[baseSchedule.length - 1].endingBalance;

  const matrix = capRateSteps.map((cap) => {
    return noiChangeSteps.map((noiShift) => {
      const stressedNOI = baseTerminalNOI * (1 + noiShift);
      const forwardNOI = stressedNOI * (1 + property.annualRentGrowth);
      const terminalValue = forwardNOI / cap;

      // Refinancing capacity under this scenario
      const maxLtvAmount = loan.refiMaxLTV * terminalValue;
      const maxDyAmount = stressedNOI / loan.refiMinDebtYield;
      const maxDscrAmount = stressedNOI / (loan.refiMinDSCR * (loan.referenceRate + loan.refiSpread));
      const maxRefi = Math.min(maxLtvAmount, maxDyAmount, maxDscrAmount);

      const shortfall = Math.max(0, balanceOwed - maxRefi);
      const netLiquidation = terminalValue * (1 - property.sellingCostsRatio - property.distressDiscount);
      const loss = shortfall > 0 ? Math.max(0, balanceOwed - netLiquidation) : 0;
      const lossSeverity = balanceOwed > 0 ? (loss / balanceOwed) * 100 : 0;

      return {
        capRate: cap,
        noiChange: noiShift,
        terminalValue,
        shortfall,
        loss,
        lossSeverity,
      };
    });
  });

  return {
    capRates: capRateSteps,
    noiChanges: noiChangeSteps,
    matrix,
  };
}
