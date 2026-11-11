/**
 * @license
 * Commercial Real Estate (CRE) Credit Underwriting & Default Risk Engine
 * Typed Domain Interfaces and Data Contracts
 */

export type Currency = 'GBP' | 'EUR' | 'USD';
export type IndexBenchmark = 'SONIA' | 'EURIBOR' | 'SOFR';
export type AmortisationType = 'interest_only' | 'amortising_balloon' | 'linear_amortising';

export interface PropertyInputs {
  propertyName: string;
  propertyType: 'Logistics' | 'Office' | 'Residential BTR' | 'Retail' | 'Hotel';
  location: string;
  currency: Currency;
  grossAreaSqFt: number;
  initialNOI: number; // Net Operating Income (Annual)
  occupancy: number; // e.g. 0.94 (94%)
  expenseRatio: number; // e.g. 0.15 (15% of EGI)
  capexReservePerYear: number; // e.g. 150,000
  annualRentGrowth: number; // e.g. 0.025 (2.5% per annum)
  entryCapRate: number; // e.g. 0.0525 (5.25%)
  exitCapRate: number; // e.g. 0.0575 (5.75%)
  sellingCostsRatio: number; // e.g. 0.02 (2.0%)
  distressDiscount: number; // e.g. 0.15 (15.0% liquidation discount)
}

export interface LoanInputs {
  loanAmount: number; // e.g. 65,000,000
  termYears: number; // e.g. 5
  benchmarkIndex: IndexBenchmark;
  referenceRate: number; // e.g. 0.0450 (4.50% current benchmark)
  marginSpread: number; // e.g. 0.0275 (275 bps)
  amortisationType: AmortisationType;
  annualAmortisationRate: number; // e.g. 0.01 (1.0% per annum if amortising)
  
  // Covenants
  covenantMinDSCR: number; // e.g. 1.20x
  covenantMaxLTV: number; // e.g. 0.70 (70%)
  covenantMinDebtYield: number; // e.g. 0.080 (8.0%)
  
  // Refinancing Parameters at Maturity
  refiSpread: number; // e.g. 0.0300 (300 bps)
  refiMaxLTV: number; // e.g. 0.65 (65%)
  refiMinDSCR: number; // e.g. 1.25x
  refiMinDebtYield: number; // e.g. 0.085 (8.5%)
  
  // Rate Cap Structure
  rateCapActive: boolean;
  rateCapStrike: number; // e.g. 0.0350 (3.50%)
  rateCapTenorYears: number; // e.g. 3 years
  rateCapCostBps: number; // e.g. 85 bps upfront premium
}

export interface CashFlowPeriod {
  year: number;
  beginningBalance: number;
  referenceRate: number;
  marginSpread: number;
  effectiveBenchmark: number; // min(refRate, strike) if cap active
  totalInterestRate: number;
  interestPayment: number;
  principalPayment: number;
  totalDebtService: number;
  endingBalance: number;
  
  // Property Level
  grossPotentialRent: number;
  occupancy: number;
  effectiveGrossIncome: number;
  operatingExpenses: number;
  capexReserve: number;
  netOperatingIncome: number;
  
  // Metrics
  dscr: number;
  dscrBreach: boolean;
  propertyValue: number;
  ltv: number;
  debtYield: number;
}

export interface RefinancingResult {
  maturityYear: number;
  balanceOwed: number;
  propertyValueMaturity: number;
  noiMaturity: number;
  refiReferenceRate: number;
  refiTotalRate: number;
  
  maxRefiByLtv: number;
  maxRefiByDebtYield: number;
  maxRefiByDscr: number;
  maxRefinanceableAmount: number;
  bindingConstraint: 'LTV' | 'Debt Yield' | 'DSCR';
  shortfall: number;
  isShortfall: boolean;
  
  // Loss Given Default
  netLiquidationValue: number;
  distressLoss: number;
  lossSeverityPercent: number;
}

export interface UnderwritingSummary {
  property: PropertyInputs;
  loan: LoanInputs;
  initialValue: number;
  initialLTV: number;
  initialDebtYield: number;
  initialDSCR: number;
  annualSchedule: CashFlowPeriod[];
  refinancing: RefinancingResult;
  minDSCR: number;
  maxLTV: number;
  totalInterestPaid: number;
  totalPrincipalPaid: number;
}

export interface MonteCarloSettings {
  numPaths: number; // e.g. 10,000, 50,000, 200,000
  seed: number;
  rateMeanReversionSpeed: number; // Vasicek a (e.g. 0.20)
  rateLongTermMean: number; // Vasicek b (e.g. 0.038)
  rateVolatility: number; // Vasicek sigma (e.g. 0.012)
  rentGrowthMean: number; // e.g. 0.025
  rentGrowthVol: number; // e.g. 0.035
  rentGrowthAR1: number; // e.g. 0.45
  occupancyMean: number; // e.g. 0.94
  occupancyVol: number; // e.g. 0.04
  majorTenantLossProbPerYear: number; // e.g. 0.03 (3% annual chance of 20% vacancy shock)
  capRateRateCorrelation: number; // e.g. 0.65 (positive link between rates and cap rates)
  capRateRentCorrelation: number; // e.g. -0.40 (negative correlation between rents and cap rates)
  rentRateCorrelation: number; // e.g. -0.25
}

export interface MonteCarloPathSummary {
  pathIndex: number;
  minDSCR: number;
  hasCovenantBreach: boolean;
  breachYear: number | null;
  breachCause: 'Rate' | 'Rent/Vacancy' | 'MajorTenantLoss' | 'Compound' | 'None';
  terminalNOI: number;
  terminalValue: number;
  terminalLTV: number;
  refiShortfall: number;
  terminalLoss: number;
}

export interface MonteCarloResults {
  settings: MonteCarloSettings;
  numPaths: number;
  executionTimeMs: number;
  covenantBreachProbability: number; // P(min DSCR < covenant)
  breachAttribution: {
    rateDrivenPercent: number;
    rentVacancyPercent: number;
    majorTenantLossPercent: number;
    compoundPercent: number;
  };
  refinancingShortfallProbability: number;
  averageShortfallIfAny: number;
  expectedLoss: number;
  expectedLossPercent: number;
  var95Loss: number;
  var99Loss: number;
  worstCaseLoss: number;
  breakevenExitCapRate: number;
  breakevenNOIDecline: number;
  ltvDistributionPercentiles: {
    p10: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
    p95: number;
  };
  dscrFanChart: {
    year: number;
    p5: number;
    p25: number;
    p50: number;
    p75: number;
    p95: number;
  }[];
  convergenceStats: {
    paths: number;
    breachProb: number;
    expectedLossPct: number;
    var95Pct: number;
  }[];
}

export interface RateCapStrikeAnalysis {
  strike: number;
  strikeLabel: string;
  breachProbability: number;
  relativeBreachReduction: number;
  upfrontCostBps: number;
  upfrontCostAmount: number;
  refiShortfallProb: number;
  expectedLossPct: number;
  protectionEfficiencyRatio: number; // breach reduction % per bps of cost
}

export interface CovariateHazardRatio {
  feature: string;
  description: string;
  coefficient: number;
  hazardRatio: number;
  ciLower95: number;
  ciUpper95: number;
  pValue: number;
}

export interface DefaultModelMetrics {
  concordanceIndex: number;
  outOfTimeConcordanceIndex: number;
  brierScore: number;
  auc1Year: number;
  auc3Year: number;
  auc5Year: number;
  sampleLoanCumulativePD: {
    year: number;
    baselineHazard: number;
    cumulativeHazard: number;
    survivalProb: number;
    cumulativePD: number;
  }[];
  covariates: CovariateHazardRatio[];
  vintageComparison: {
    vintageGroup: string;
    description: string;
    sampleSize: number;
    defaultRate5Yr: number;
    cIndex: number;
  }[];
}

export interface RiskRatingAssessment {
  rating: 1 | 2 | 3 | 4 | 5;
  ratingLabel: string;
  recommendation: 'Approve' | 'Approve with Conditions' | 'Decline';
  oneYearPD: number;
  fiveYearPD: number;
  lgd: number;
  expectedLossAnnual: number;
  expectedLossLifetime: number;
  ratingRationale: string[];
  keyStrengths: string[];
  keyVulnerabilities: string[];
  macroSensitivityGrid: {
    rateShiftBps: number;
    propertyValueShiftPct: number;
    pd5Yr: number;
    refiShortfall: number;
    lossAmount: number;
    impliedRating: number;
  }[];
}
