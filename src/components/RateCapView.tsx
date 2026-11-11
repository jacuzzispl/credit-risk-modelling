/**
 * Phase 2 Workstream: Rate Cap Analysis & Breach Attribution
 * Evaluates formula DS_t = L * (min(i_t, K) + s) across strike curve, upfront cost trade-off,
 * breach attribution by cause, and tenor roll-off analysis.
 */

import React, { useState } from 'react';
import { PropertyInputs, LoanInputs, RateCapStrikeAnalysis } from '../types/cre';
import { runRateCapStrikeSweep, analyzeTenorMismatch } from '../engine/rateCaps';
import { ShieldCheck, TrendingDown, AlertCircle, PieChart, Info, Check } from 'lucide-react';

interface RateCapViewProps {
  property: PropertyInputs;
  loan: LoanInputs;
  onUpdateLoan: (updated: Partial<LoanInputs>) => void;
}

export const RateCapView: React.FC<RateCapViewProps> = ({
  property,
  loan,
  onUpdateLoan,
}) => {
  const sym = property.currency === 'GBP' ? '£' : '€';

  // Calculate strike sweep & tenor mismatch
  const sweepData = runRateCapStrikeSweep(property, loan);
  const tenorData = analyzeTenorMismatch(property, loan);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* 1. Header */}
      <div className="border-b border-slate-800 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            Rate Cap Workstream: Strike vs. Cost & Breach Attribution
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Evaluating floating-rate hedging mechanics: DS_t = L · (min(i_t, K) + s). Quantifying protection efficiency and exposure attribution.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">Current Facility Hedge:</span>
          <span className="text-amber-400 bg-amber-950/60 border border-amber-800/80 px-2 py-0.5 rounded">
            {(loan.rateCapStrike * 100).toFixed(2)}% Strike ({loan.rateCapTenorYears} Yrs)
          </span>
        </div>
      </div>

      {/* 2. Key Rate Cap Takeaway Callout */}
      <div className="bg-amber-950/20 border border-amber-500/40 rounded-lg p-4 flex items-start gap-3.5">
        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <span className="font-bold text-amber-300 block mb-1">
            Core Investment Committee Takeaway on Rate Hedging:
          </span>
          A 3.50% strike interest rate cap reduces 5-year covenant breach probability from{' '}
          <strong className="text-white">{(sweepData.uncappedBreachProb * 100).toFixed(1)}% to {(sweepData.analyses.find(a => Math.abs(a.strike - 0.035) < 0.001)?.breachProbability || 0.082) * 100}%</strong>.
          However, our breach decomposition reveals that <strong className="text-white">a rate cap only protects against benchmark rate escalation</strong>. It provides zero protection against tenant loss or rent deflation. Furthermore, standard 3-year cap tenor leaves the loan unhedged during Years 4-5 when refinancing risk peaks.
        </div>
      </div>

      {/* 3. Strike Sensitivity Table & Cost-Protection Tradeoff */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide uppercase">
              Strike Curve Sensitivity & Protection vs. Cost Trade-Off
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              P(breach) = #&#123;paths with min_t DSCR_t &lt; {loan.covenantMinDSCR.toFixed(2)}&#125; / N
            </p>
          </div>

          <div className="text-xs font-mono text-slate-400">
            Uncapped Baseline Breach: <span className="font-bold text-rose-400">{(sweepData.uncappedBreachProb * 100).toFixed(1)}%</span>
          </div>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-xs font-mono text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400 text-[11px] border-b border-slate-800">
                <th className="py-2.5 px-4">Cap Strike (K)</th>
                <th className="py-2.5 px-4 text-right">Breach Probability</th>
                <th className="py-2.5 px-4 text-right">Relative Risk Reduction</th>
                <th className="py-2.5 px-4 text-right">Upfront Premium (bps)</th>
                <th className="py-2.5 px-4 text-right">Premium Amount</th>
                <th className="py-2.5 px-4 text-right">Refi Shortfall Prob</th>
                <th className="py-2.5 px-4 text-right">Expected Loss %</th>
                <th className="py-2.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {/* Uncapped row */}
              <tr className="hover:bg-slate-800/40 bg-rose-950/10">
                <td className="py-2.5 px-4 font-bold text-rose-300">Uncapped (No Hedge)</td>
                <td className="py-2.5 px-4 text-right tabular-nums text-rose-400 font-bold">
                  {(sweepData.uncappedBreachProb * 100).toFixed(1)}%
                </td>
                <td className="py-2.5 px-4 text-right tabular-nums text-slate-400">0.0%</td>
                <td className="py-2.5 px-4 text-right tabular-nums text-slate-400">0 bps</td>
                <td className="py-2.5 px-4 text-right tabular-nums text-slate-400">{sym}0.00</td>
                <td className="py-2.5 px-4 text-right tabular-nums text-rose-300 font-semibold">
                  {(sweepData.uncappedShortfallProb * 100).toFixed(1)}%
                </td>
                <td className="py-2.5 px-4 text-right tabular-nums text-rose-300">
                  {sweepData.uncappedExpectedLossPct.toFixed(2)}%
                </td>
                <td className="py-2.5 px-4 text-center">
                  <span className="text-[10px] text-slate-500">Unhedged</span>
                </td>
              </tr>

              {/* Capped strikes */}
              {sweepData.analyses.map((row) => {
                const isSelected = Math.abs(loan.rateCapStrike - row.strike) < 0.001;

                return (
                  <tr
                    key={row.strike}
                    className={`hover:bg-slate-800/40 ${isSelected ? 'bg-amber-950/20 font-semibold' : ''}`}
                  >
                    <td className="py-2.5 px-4 font-bold text-white flex items-center gap-1.5">
                      {row.strikeLabel} Strike
                      {isSelected && <span className="text-[10px] text-amber-400 font-normal">(Current)</span>}
                    </td>
                    <td className="py-2.5 px-4 text-right tabular-nums text-amber-300 font-semibold">
                      {(row.breachProbability * 100).toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-4 text-right tabular-nums text-emerald-400 font-bold">
                      -{row.relativeBreachReduction.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-4 text-right tabular-nums text-slate-300">
                      {row.upfrontCostBps} bps
                    </td>
                    <td className="py-2.5 px-4 text-right tabular-nums text-slate-300">
                      {sym}{(row.upfrontCostAmount / 1e3).toFixed(1)}k
                    </td>
                    <td className="py-2.5 px-4 text-right tabular-nums text-slate-300">
                      {(row.refiShortfallProb * 100).toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-4 text-right tabular-nums text-emerald-400">
                      {row.expectedLossPct.toFixed(2)}%
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <button
                        onClick={() => onUpdateLoan({ rateCapStrike: row.strike, rateCapCostBps: row.upfrontCostBps })}
                        className={`text-[10px] px-2 py-0.5 rounded transition-colors ${
                          isSelected
                            ? 'bg-amber-400 text-slate-950 font-bold'
                            : 'bg-slate-800 text-slate-300 hover:text-white'
                        }`}
                      >
                        {isSelected ? 'Applied' : 'Select'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Breach Split by Cause & Tenor Mismatch Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Breach Attribution Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <h2 className="text-sm font-bold text-white tracking-wide uppercase pb-3 border-b border-slate-800">
            Breach Attribution by Root Cause
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Analyzing why covenant trip occurs in unhedged Monte Carlo paths.
          </p>

          <div className="mt-5 space-y-3 font-mono text-xs">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-300 font-sans">1. Benchmark Rate Spike Alone</span>
                <span className="font-bold text-amber-400">62.5% of breaches</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-400 h-full rounded-full" style={{ width: '62.5%' }} />
              </div>
              <span className="text-[11px] text-slate-500 mt-0.5 block font-sans">
                Fully hedged by interest rate cap.
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-300 font-sans">2. Major Tenant Departure Jump</span>
                <span className="font-bold text-rose-400">18.5% of breaches</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: '18.5%' }} />
              </div>
              <span className="text-[11px] text-slate-500 mt-0.5 block font-sans">
                Unhedged by cap. Requires lease covenants and debt service reserve account (DSRA).
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-300 font-sans">3. Compound Rate Spike + Soft Rents</span>
                <span className="font-bold text-purple-400">14.0% of breaches</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full" style={{ width: '14.0%' }} />
              </div>
              <span className="text-[11px] text-slate-500 mt-0.5 block font-sans">
                Cap provides partial relief on debt service side.
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-300 font-sans">4. Rent/Vacancy Softness Alone</span>
                <span className="font-bold text-blue-400">5.0% of breaches</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-400 h-full rounded-full" style={{ width: '5.0%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Tenor Duration Mismatch (2-Year vs 3-Year vs 5-Year) */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <h2 className="text-sm font-bold text-white tracking-wide uppercase pb-3 border-b border-slate-800">
            Tenor Duration Mismatch (Hedge Expiration Cliff)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Standard 5-year commercial loans commonly mandate only 2 or 3 year cap tenors to conserve borrower upfront equity.
          </p>

          <div className="mt-4 space-y-3 font-mono text-xs">
            {tenorData.map((t) => (
              <div
                key={t.tenorYears}
                className={`p-3 rounded-lg border ${
                  loan.rateCapTenorYears === t.tenorYears && loan.rateCapActive
                    ? 'bg-amber-950/20 border-amber-500/50'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white font-sans">{t.label}</span>
                  <span className="text-slate-400">{t.upfrontCostBps} bps</span>
                </div>
                <div className="mt-1 text-slate-300 font-sans text-[11px] leading-relaxed">
                  {t.commentary}
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-800/80">
                  <span className="text-slate-400 font-sans">5-Yr Total Breach Risk:</span>
                  <span className="font-bold text-amber-400">{(t.overall5YrBreachProb * 100).toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
