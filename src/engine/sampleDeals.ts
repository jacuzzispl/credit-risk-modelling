/**
 * Sample Deal Presets
 * Pre-configured institutional commercial real estate transactions.
 * Default flagship deal: Project Meridian (Prime Thames Valley Logistics Hub, UK / Apollo Platform fit).
 */

import { PropertyInputs, LoanInputs } from '../types/cre';

export interface DealPreset {
  id: string;
  name: string;
  tagline: string;
  narrative: string;
  borrower: string;
  sponsorTrackRecord: string;
  property: PropertyInputs;
  loan: LoanInputs;
}

export const SAMPLE_DEALS: DealPreset[] = [
  {
    id: 'meridian_logistics',
    name: 'Project Meridian (UK Logistics)',
    tagline: '£65.0M Senior Floating Facility · 210,000 sq ft Class-A Logistics Hub · Thames Valley, UK',
    narrative: 'Senior floating-rate first mortgage loan to refinance existing construction debt and fund tenant improvements on a recently completed institutional-spec logistics facility leased to two investment-grade logistics operators (WAULT 8.4 years).',
    borrower: 'Meridian Logistics PropCo S.à r.l. (sponsored by Brookfield / Greycoat JV)',
    sponsorTrackRecord: 'Tier-1 European Logistics Sponsor with >£3.2bn AUM and zero historical loan defaults.',
    property: {
      propertyName: 'Project Meridian Distribution Centre',
      propertyType: 'Logistics',
      location: 'Reading / Thames Valley (M4 Corridor), UK',
      currency: 'GBP',
      grossAreaSqFt: 210000,
      initialNOI: 5720000, // £5.72M stabilized NOI
      occupancy: 0.96, // 96%
      expenseRatio: 0.12, // 12% non-recoverable opex & asset management
      capexReservePerYear: 120000,
      annualRentGrowth: 0.0275, // 2.75% per year
      entryCapRate: 0.0520, // 5.20% prime logistics exit yield
      exitCapRate: 0.0560, // 5.60% exit cap rate
      sellingCostsRatio: 0.020, // 2.0% transaction disposal costs
      distressDiscount: 0.150, // 15% distress haircut in forced liquidation
    },
    loan: {
      loanAmount: 65000000, // £65M senior debt
      termYears: 5,
      benchmarkIndex: 'SONIA',
      referenceRate: 0.0450, // 4.50% current benchmark
      marginSpread: 0.0265, // 2.65% (265 bps)
      amortisationType: 'interest_only',
      annualAmortisationRate: 0.0,
      covenantMinDSCR: 1.20,
      covenantMaxLTV: 0.68,
      covenantMinDebtYield: 0.082,
      refiSpread: 0.0290, // 2.90% refi exit spread assumption
      refiMaxLTV: 0.65,
      refiMinDSCR: 1.25,
      refiMinDebtYield: 0.0875,
      rateCapActive: true,
      rateCapStrike: 0.0350, // 3.50% strike cap
      rateCapTenorYears: 3, // 3 years initial tenor
      rateCapCostBps: 85, // 85 bps upfront premium (~£552.5k)
    },
  },
  {
    id: 'frankfurt_office',
    name: 'Mainzer Tower (Frankfurt Office)',
    tagline: '€82.0M Senior Floating Facility · 28,500 sqm Prime CBD Office · Frankfurt am Main',
    narrative: 'Senior debt financing for the recapitalization and green refurbishment (DGNB Platinum) of a core office tower in Frankfurt banking district with multi-let corporate tenant base.',
    borrower: 'Frankfurt Core Real Estate Inv S.C.A.',
    sponsorTrackRecord: 'Pan-European core-plus manager managing €4.8bn in prime European CBD offices.',
    property: {
      propertyName: 'Mainzer Tower',
      propertyType: 'Office',
      location: 'Frankfurt am Main, Germany',
      currency: 'EUR',
      grossAreaSqFt: 306000,
      initialNOI: 6850000,
      occupancy: 0.91,
      expenseRatio: 0.16,
      capexReservePerYear: 250000,
      annualRentGrowth: 0.0180,
      entryCapRate: 0.0490,
      exitCapRate: 0.0550,
      sellingCostsRatio: 0.025,
      distressDiscount: 0.200,
    },
    loan: {
      loanAmount: 82000000,
      termYears: 5,
      benchmarkIndex: 'EURIBOR',
      referenceRate: 0.0340, // 3.40% 3M Euribor
      marginSpread: 0.0285, // 285 bps
      amortisationType: 'interest_only',
      annualAmortisationRate: 0.0,
      covenantMinDSCR: 1.20,
      covenantMaxLTV: 0.65,
      covenantMinDebtYield: 0.080,
      refiSpread: 0.0310,
      refiMaxLTV: 0.60,
      refiMinDSCR: 1.30,
      refiMinDebtYield: 0.085,
      rateCapActive: true,
      rateCapStrike: 0.0325,
      rateCapTenorYears: 3,
      rateCapCostBps: 92,
    },
  },
  {
    id: 'nordic_living',
    name: 'Stockholm Living (BTR Residential)',
    tagline: '€44.0M Senior Facility · 340-Unit Purpose-Built BTR Community · Stockholm, Sweden',
    narrative: 'Senior green loan to finance the stabilization of an energy-positive residential community in the high-demand Stockholm commuter belt with regulated sub-market rents.',
    borrower: 'Nordic Urban Living HoldCo AB',
    sponsorTrackRecord: 'Top-tier Nordic residential specialist with 14,000 units developed and managed.',
    property: {
      propertyName: 'Solna Strand Living Park',
      propertyType: 'Residential BTR',
      location: 'Stockholm (Solna), Sweden',
      currency: 'EUR',
      grossAreaSqFt: 245000,
      initialNOI: 3950000,
      occupancy: 0.98,
      expenseRatio: 0.22,
      capexReservePerYear: 90000,
      annualRentGrowth: 0.0310,
      entryCapRate: 0.0425,
      exitCapRate: 0.0460,
      sellingCostsRatio: 0.018,
      distressDiscount: 0.120,
    },
    loan: {
      loanAmount: 44000000,
      termYears: 5,
      benchmarkIndex: 'EURIBOR',
      referenceRate: 0.0340,
      marginSpread: 0.0235, // 235 bps
      amortisationType: 'interest_only',
      annualAmortisationRate: 0.0,
      covenantMinDSCR: 1.25,
      covenantMaxLTV: 0.60,
      covenantMinDebtYield: 0.085,
      refiSpread: 0.0260,
      refiMaxLTV: 0.60,
      refiMinDSCR: 1.25,
      refiMinDebtYield: 0.090,
      rateCapActive: true,
      rateCapStrike: 0.0350,
      rateCapTenorYears: 3,
      rateCapCostBps: 65,
    },
  },
];
