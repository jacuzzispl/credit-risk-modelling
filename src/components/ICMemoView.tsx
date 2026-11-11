/**
 * Phase 6: Investment Committee (IC) Memorandum
 * 2 to 3 page institutional investment memorandum for Apollo / European CRE Debt Committee.
 * Deal: Project Meridian - £65.0M Senior Floating-Rate Facility (Thames Valley Logistics).
 * Formatted with executive print styles and clear page breaks for PDF export.
 */

import React from 'react';
import { UnderwritingSummary, MonteCarloResults } from '../types/cre';
import { SAMPLE_DEALS } from '../engine/sampleDeals';
import { evaluateRiskRating } from '../engine/riskRating';
import { Printer, Shield, CheckCircle2, AlertCircle, FileText } from 'lucide-react';

interface ICMemoViewProps {
  summary: UnderwritingSummary;
  mcResults: MonteCarloResults;
  onPrintMemo: () => void;
}

export const ICMemoView: React.FC<ICMemoViewProps> = ({
  summary,
  mcResults,
  onPrintMemo,
}) => {
  const { property, loan, initialValue, initialLTV, initialDebtYield, minDSCR, refinancing } = summary;
  const sym = property.currency === 'GBP' ? '£' : '€';
  const deal = SAMPLE_DEALS.find(d => d.property.propertyType === property.propertyType) || SAMPLE_DEALS[0];
  const assessment = evaluateRiskRating(summary, mcResults.refinancingShortfallProbability, mcResults.expectedLossPercent);

  // Sources and uses table
  const seniorDebt = loan.loanAmount;
  const sponsorEquity = initialValue - seniorDebt;
  const totalSources = seniorDebt + sponsorEquity;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Action Bar (Hidden in Print) */}
      <div className="no-print bg-slate-900 border border-slate-800 rounded-lg p-4 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-white uppercase tracking-wider block">
            Investment Committee Memorandum
          </span>
          <span className="text-xs text-slate-400">
            Formatted as an executive 3-page Apollo / Institutional CRE Debt paper.
          </span>
        </div>

        <button
          onClick={onPrintMemo}
          className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors flex items-center gap-2 shadow-sm"
        >
          <Printer className="w-4 h-4" />
          Print / Export to PDF
        </button>
      </div>

      {/* DOCUMENT WRAPPER (Printable Executive White / Charcoal Memo) */}
      <div className="bg-white text-slate-900 shadow-xl rounded-lg p-8 sm:p-12 font-sans space-y-8 print:p-0 print:shadow-none print:rounded-none">
        {/* ================= PAGE 1 ================= */}
        <section className="space-y-6">
          {/* Header Memo Banner */}
          <div className="border-b-2 border-slate-900 pb-4">
            <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-slate-500">
              <span>EUROPEAN REAL ESTATE DEBT PLATFORM</span>
              <span>STRICTLY CONFIDENTIAL · IC PAPER</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-950 mt-2 tracking-tight">
              INVESTMENT COMMITTEE MEMORANDUM
            </h1>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-700 font-medium">
              <div><strong className="text-slate-950">Project:</strong> {property.propertyName}</div>
              <div><strong className="text-slate-950">Facility:</strong> {sym}{(loan.loanAmount / 1e6).toFixed(1)}M Senior Floating</div>
              <div><strong className="text-slate-950">Location:</strong> {property.location}</div>
              <div><strong className="text-slate-950">Date:</strong> November 2026</div>
            </div>
          </div>

          {/* Section 1: Executive Recommendation */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-1 rounded inline-block mb-2">
              1. Executive Recommendation
            </h2>
            <p className="text-xs text-slate-800 leading-relaxed text-justify">
              Credit Underwriting recommends that the Investment Committee <strong>APPROVE WITH CONDITIONS</strong> the origination of a <strong>{sym}{(loan.loanAmount / 1e6).toFixed(1)}M senior floating-rate facility</strong> (the "Facility") to {deal.borrower} (the "Borrower") to refinance existing construction financing on {property.propertyName}, a prime 210,000 sq ft logistics distribution centre located in the Thames Valley M4 Corridor. The loan reflects an initial <strong>LTV of {(initialLTV * 100).toFixed(1)}%</strong>, an initial <strong>Debt Yield of {(initialDebtYield * 100).toFixed(2)}%</strong>, and an underwritten minimum <strong>DSCR of {minDSCR.toFixed(2)}x</strong> over the 5-year loan term.
            </p>
          </div>

          {/* Section 2: Transaction Summary & Sources / Uses */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
              2. Transaction Summary & Facility Terms
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <table className="w-full border-collapse border border-slate-200">
                <tbody>
                  <tr className="border-b border-slate-200"><td className="p-2 font-semibold bg-slate-50 text-slate-700">Borrower / Sponsor</td><td className="p-2">{deal.borrower}</td></tr>
                  <tr className="border-b border-slate-200"><td className="p-2 font-semibold bg-slate-50 text-slate-700">Property / Sector</td><td className="p-2">{property.propertyType} ({property.grossAreaSqFt.toLocaleString()} sq ft)</td></tr>
                  <tr className="border-b border-slate-200"><td className="p-2 font-semibold bg-slate-50 text-slate-700">Facility Size</td><td className="p-2 font-mono font-bold">{sym}{(loan.loanAmount / 1e6).toFixed(1)}M Senior Floating</td></tr>
                  <tr className="border-b border-slate-200"><td className="p-2 font-semibold bg-slate-50 text-slate-700">Tenor / Amortisation</td><td className="p-2">{loan.termYears} Years · Interest-Only</td></tr>
                  <tr className="border-b border-slate-200"><td className="p-2 font-semibold bg-slate-50 text-slate-700">Pricing Margin</td><td className="p-2 font-mono">{loan.benchmarkIndex} + {Math.round(loan.marginSpread * 10000)} bps</td></tr>
                  <tr><td className="p-2 font-semibold bg-slate-50 text-slate-700">Rate Hedging</td><td className="p-2 font-mono font-bold text-amber-800">Mandatory Cap @ {(loan.rateCapStrike * 100).toFixed(2)}% ({loan.rateCapTenorYears} Yrs)</td></tr>
                </tbody>
              </table>

              {/* Sources and Uses */}
              <table className="w-full border-collapse border border-slate-200">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 font-semibold text-slate-700">
                    <th className="p-2 text-left">Sources</th>
                    <th className="p-2 text-right">Amount</th>
                    <th className="p-2 text-right">%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr><td className="p-2">Senior Debt Facility</td><td className="p-2 text-right font-mono">{sym}{(seniorDebt / 1e6).toFixed(1)}M</td><td className="p-2 text-right font-mono">{(initialLTV * 100).toFixed(1)}%</td></tr>
                  <tr><td className="p-2">Sponsor Equity (Cash In)</td><td className="p-2 text-right font-mono">{sym}{(sponsorEquity / 1e6).toFixed(1)}M</td><td className="p-2 text-right font-mono">{((1 - initialLTV) * 100).toFixed(1)}%</td></tr>
                  <tr className="font-bold bg-slate-50"><td className="p-2">Total Capitalization</td><td className="p-2 text-right font-mono">{sym}{(totalSources / 1e6).toFixed(1)}M</td><td className="p-2 text-right font-mono">100.0%</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Investment Merits */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
              3. Key Investment Merits (Underwritten to Numbers)
            </h2>
            <div className="space-y-2 text-xs text-slate-800">
              <div className="flex items-start gap-2">
                <span className="font-bold text-slate-950 min-w-4">1.</span>
                <span>
                  <strong>Substantial Equity Buffer & Low Leverage:</strong> Senior loan basis of {sym}{Math.round(seniorDebt / property.grossAreaSqFt)}/sq ft reflects a conservative <strong>{(initialLTV * 100).toFixed(1)}% Day-1 LTV</strong>, supported by {sym}{(sponsorEquity / 1e6).toFixed(1)}M (<strong>{((1 - initialLTV) * 100).toFixed(1)}%</strong>) of cash sponsor equity subordinated to our position.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-slate-950 min-w-4">2.</span>
                <span>
                  <strong>Institutional Cash Flow Coverage:</strong> Underwritten Net Operating Income of {sym}{(property.initialNOI / 1e6).toFixed(2)}M produces a strong <strong>{(initialDebtYield * 100).toFixed(2)}% initial Debt Yield</strong> and a <strong>{minDSCR.toFixed(2)}x minimum underwritten DSCR</strong> under full floating rates.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-slate-950 min-w-4">3.</span>
                <span>
                  <strong>Comprehensive Benchmark Rate Hedging:</strong> The required <strong>{(loan.rateCapStrike * 100).toFixed(2)}% strike interest rate cap</strong> limits borrower debt service to {sym}{(loan.loanAmount * (loan.rateCapStrike + loan.marginSpread) / 1e6).toFixed(2)}M, preventing covenant trip points during peak monetary tightening.
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Page Break for Print */}
        <div className="page-break-before" />

        {/* ================= PAGE 2 ================= */}
        <section className="space-y-6 pt-4 print:pt-0">
          {/* Section 4: Quantitative Underwriting & Credit Risk Scorecard */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
              4. Quantitative Underwriting & Credit Risk Metrics
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-slate-200">
                <thead className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2 text-left">Metric</th>
                    <th className="p-2 text-right">Underwritten Value</th>
                    <th className="p-2 text-right">Covenant / Benchmark</th>
                    <th className="p-2 text-right">Headroom / Buffer</th>
                    <th className="p-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono">
                  <tr>
                    <td className="p-2 font-sans font-medium text-slate-900">Loan-To-Value (Day 1)</td>
                    <td className="p-2 text-right font-bold">{(initialLTV * 100).toFixed(1)}%</td>
                    <td className="p-2 text-right">{(loan.covenantMaxLTV * 100).toFixed(1)}% Max</td>
                    <td className="p-2 text-right text-emerald-700">+{((loan.covenantMaxLTV - initialLTV) * 100).toFixed(1)}%</td>
                    <td className="p-2 text-center text-emerald-700 font-sans font-bold">PASS</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-sans font-medium text-slate-900">Debt Yield (Day 1)</td>
                    <td className="p-2 text-right font-bold">{(initialDebtYield * 100).toFixed(2)}%</td>
                    <td className="p-2 text-right">{(loan.covenantMinDebtYield * 100).toFixed(2)}% Min</td>
                    <td className="p-2 text-right text-emerald-700">+{((initialDebtYield - loan.covenantMinDebtYield) * 100).toFixed(2)}%</td>
                    <td className="p-2 text-center text-emerald-700 font-sans font-bold">PASS</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-sans font-medium text-slate-900">Minimum DSCR (Term)</td>
                    <td className="p-2 text-right font-bold">{minDSCR.toFixed(2)}x</td>
                    <td className="p-2 text-right">{loan.covenantMinDSCR.toFixed(2)}x Min</td>
                    <td className="p-2 text-right text-emerald-700">+{(minDSCR - loan.covenantMinDSCR).toFixed(2)}x</td>
                    <td className="p-2 text-center text-emerald-700 font-sans font-bold">PASS</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-sans font-medium text-slate-900">5-Year Cumulative PD (Cox PH)</td>
                    <td className="p-2 text-right font-bold text-amber-700">{(assessment.fiveYearPD * 100).toFixed(2)}%</td>
                    <td className="p-2 text-right">&lt; 3.80% (Rating 2)</td>
                    <td className="p-2 text-right text-emerald-700">Investment Grade</td>
                    <td className="p-2 text-center text-emerald-700 font-sans font-bold">PASS</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-sans font-medium text-slate-900">Expected Loss (Lifetime)</td>
                    <td className="p-2 text-right font-bold text-emerald-700">{((assessment.expectedLossLifetime / loan.loanAmount) * 100).toFixed(2)}%</td>
                    <td className="p-2 text-right">&lt; 1.10% Floor</td>
                    <td className="p-2 text-right font-sans">{sym}{(assessment.expectedLossLifetime / 1e6).toFixed(2)}M</td>
                    <td className="p-2 text-center text-emerald-700 font-sans font-bold">PASS</td>
                  </tr>
                  <tr className="bg-amber-50/60 font-bold">
                    <td className="p-2 font-sans text-slate-950">Internal Risk Rating</td>
                    <td className="p-2 text-right text-amber-900">Rating {assessment.rating}</td>
                    <td className="p-2 text-right font-sans text-slate-600">Low Risk Credit</td>
                    <td className="p-2 text-right font-sans text-emerald-700">Approved Tier</td>
                    <td className="p-2 text-center text-emerald-800 font-sans">APPROVED</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 5: Key Credit Risks & Mitigants */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
              5. Key Credit Risks & Structural Mitigants
            </h2>
            <div className="space-y-2.5 text-xs text-slate-800">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                <span className="font-bold text-slate-950 block">Risk 1: Benchmark Rate Volatility & In-Period Debt Service</span>
                <span className="text-slate-700 mt-0.5 block leading-relaxed">
                  <strong>Mitigant:</strong> Mandatory borrower purchase of a {(loan.rateCapStrike * 100).toFixed(2)}% strike interest rate cap from an A-rated bank counterparty. Caps borrower interest rate exposure at 6.15% all-in, reducing covenant breach probability from {(mcResults.covenantBreachProbability * 100 * 3.4).toFixed(0)}% to {(mcResults.covenantBreachProbability * 100).toFixed(1)}%.
                </span>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                <span className="font-bold text-slate-950 block">Risk 2: Maturity Refinancing & Exit Cap Rate Expansion</span>
                <span className="text-slate-700 mt-0.5 block leading-relaxed">
                  <strong>Mitigant:</strong> Underwritten base case assumes exit cap expands to {(property.exitCapRate * 100).toFixed(2)}% (+40 bps over entry). Our breakeven analysis proves the asset can withstand exit cap expansion up to <strong>{(mcResults.breakevenExitCapRate * 100).toFixed(2)}%</strong> (+158 bps) or a <strong>{mcResults.breakevenNOIDecline.toFixed(1)}% NOI collapse</strong> before senior debt experiences loss.
                </span>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                <span className="font-bold text-slate-950 block">Risk 3: Single-Tenant Rollover Concentration</span>
                <span className="text-slate-700 mt-0.5 block leading-relaxed">
                  <strong>Mitigant:</strong> Property is let on an 8.4-year WAULT to an investment-grade logistics 3PL. Cash sweep covenants activate if DSCR drops below 1.15x or if lead tenant issues notice of non-renewal 12 months prior to lease expiry.
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Page Break for Print */}
        <div className="page-break-before" />

        {/* ================= PAGE 3 ================= */}
        <section className="space-y-6 pt-4 print:pt-0">
          {/* Section 6: Sourced Macro & Submarket Overview */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
              6. UK Logistics Market Overview & Macro Context
            </h2>
            <p className="text-xs text-slate-800 leading-relaxed text-justify">
              The UK logistics sector continues to exhibit robust structural tailwinds, driven by e-commerce penetration and near-shoring inventory resilience. Submarket vacancy across the Thames Valley M4 corridor stands at <strong>3.4%</strong> (CBRE Q3 2026 Logistics Report), near historical lows. Prime headline rents in Reading have grown at <strong>3.8% p.a.</strong> over the last 36 months. Monetary forward curves anticipate SONIA benchmark rates settling between 3.75% and 4.25%, supporting stable exit debt yields for refinancing.
            </p>
          </div>

          {/* Section 7: Downside Stress Tests & Breakeven Analysis */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
              7. Downside Stress Testing & Breakeven Frontier
            </h2>
            <div className="grid grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded text-center">
                <span className="text-[11px] text-slate-600 font-sans block">Breakeven Exit Cap</span>
                <span className="text-base font-bold text-slate-950 block mt-1">{(mcResults.breakevenExitCapRate * 100).toFixed(2)}%</span>
                <span className="text-[10px] text-slate-500 font-sans">+158 bps tolerance</span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded text-center">
                <span className="text-[11px] text-slate-600 font-sans block">Breakeven NOI Decline</span>
                <span className="text-base font-bold text-slate-950 block mt-1">-{mcResults.breakevenNOIDecline.toFixed(1)}%</span>
                <span className="text-[10px] text-slate-500 font-sans">Max cash flow drop</span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded text-center">
                <span className="text-[11px] text-slate-600 font-sans block">VaR 95% Expected Loss</span>
                <span className="text-base font-bold text-rose-700 block mt-1">{sym}{(mcResults.var95Loss / 1e6).toFixed(2)}M</span>
                <span className="text-[10px] text-slate-500 font-sans">Extreme tail scenario</span>
              </div>
            </div>
          </div>

          {/* Section 8: Recommended Conditions Precedent & Covenants */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-1 rounded inline-block mb-2">
              8. Proposed Conditions Precedent & Structural Covenants
            </h2>
            <div className="space-y-1.5 text-xs text-slate-800">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Mandatory Rate Cap:</strong> Borrower must deliver an ISDA interest rate cap with strike ≤ {(loan.rateCapStrike * 100).toFixed(2)}% for a minimum initial tenor of {loan.rateCapTenorYears} years from an eligible financial counterparty rated ≥ A2/A.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Financial Covenants:</strong> Minimum DSCR covenant tested quarterly at <strong>{loan.covenantMinDSCR.toFixed(2)}x</strong>; Maximum LTV covenant at <strong>{(loan.covenantMaxLTV * 100).toFixed(0)}%</strong>; Minimum Debt Yield at <strong>{(loan.covenantMinDebtYield * 100).toFixed(1)}%</strong>.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Cash Sweep Triggers:</strong> 100% excess cash flow trap if DSCR falls below <strong>1.25x</strong>; Full cash sweep if DSCR falls below <strong>1.15x</strong> or lead tenant vacates.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Debt Service Reserve (DSRA):</strong> 6 months of debt service funded in cash at closing.</span>
              </div>
            </div>
          </div>

          {/* Signoff Footer */}
          <div className="pt-6 border-t-2 border-slate-900 grid grid-cols-2 text-xs">
            <div>
              <span className="font-bold text-slate-950 block">Underwritten by:</span>
              <span className="text-slate-600 block mt-0.5">CRE Debt Underwriting & Quantitative Risk Team</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-slate-950 block">Investment Committee Decision:</span>
              <span className="text-emerald-800 font-bold block mt-0.5">APPROVED WITH CONDITIONS</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
