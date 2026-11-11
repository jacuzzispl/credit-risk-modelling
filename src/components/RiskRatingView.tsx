/**
 * Phase 4: Integration, Risk Rating & Expected Loss View
 * Apollo Institutional 1-5 Credit Scorecard, EL = PD * LGD * EAD,
 * and 2D Macro Sensitivity Matrix (+/- 200bps rate vs +/- 30% asset value).
 */

import React from 'react';
import { PropertyInputs, LoanInputs, UnderwritingSummary } from '../types/cre';
import { evaluateRiskRating } from '../engine/riskRating';
import { ShieldCheck, Award, AlertTriangle, TrendingDown, CheckCircle2, Sliders } from 'lucide-react';

interface RiskRatingViewProps {
  summary: UnderwritingSummary;
  shortfallProb: number;
  expectedLossPct: number;
}

export const RiskRatingView: React.FC<RiskRatingViewProps> = ({
  summary,
  shortfallProb,
  expectedLossPct,
}) => {
  const { property, loan } = summary;
  const sym = property.currency === 'GBP' ? '£' : '€';
  const assessment = evaluateRiskRating(summary, shortfallProb, expectedLossPct);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* 1. Header */}
      <div className="border-b border-slate-800 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Award className="w-5 h-5 text-amber-400" />
            Phase 4: Credit Risk Rating & Expected Loss Integration
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Institutional rating assessment (1 to 5 scale), Expected Loss (EL = PD · LGD · EAD), and comprehensive macroeconomic sensitivity stress grid.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Assigned Rating:</span>
          <span className="font-mono text-xs font-bold text-slate-950 bg-amber-400 px-2.5 py-1 rounded shadow-sm">
            RATING {assessment.rating} · {assessment.recommendation.toUpperCase()}
          </span>
        </div>
      </div>

      {/* 2. Rating Badge & EL Card Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Rating Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 md:col-span-1 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Internal Risk Rating
            </span>
            <div className="mt-2 text-3xl font-extrabold text-amber-400 font-mono">
              Rating {assessment.rating}
            </div>
            <div className="text-xs font-medium text-slate-300 mt-1">
              {assessment.ratingLabel}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800">
            <span className="text-[11px] text-slate-400 block font-sans">IC Recommendation:</span>
            <span className="text-xs font-bold text-emerald-400 mt-0.5 block">
              {assessment.recommendation}
            </span>
          </div>
        </div>

        {/* Expected Loss Math Breakdown: EL = PD * LGD * EAD */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 md:col-span-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Expected Loss Formulation: EL = PD · LGD · EAD
            </span>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              Lifetime EL: {sym}{(assessment.expectedLossLifetime / 1e6).toFixed(2)}M ({((assessment.expectedLossLifetime / loan.loanAmount) * 100).toFixed(2)}%)
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4 text-center">
            <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg">
              <span className="text-xs text-slate-400 block">5-Year Cumulative PD</span>
              <div className="mt-1 font-mono text-lg font-bold text-amber-300">
                {(assessment.fiveYearPD * 100).toFixed(2)}%
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">From Cox PH Model</span>
            </div>

            <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg">
              <span className="text-xs text-slate-400 block">Loss Given Default (LGD)</span>
              <div className="mt-1 font-mono text-lg font-bold text-slate-200">
                {(assessment.lgd * 100).toFixed(1)}%
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">Post-Distress Liquidation</span>
            </div>

            <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg">
              <span className="text-xs text-slate-400 block">Exposure at Default (EAD)</span>
              <div className="mt-1 font-mono text-lg font-bold text-slate-200">
                {sym}{(loan.loanAmount / 1e6).toFixed(1)}M
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">Facility Principal</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Rating Scorecard & Rationale */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rating Rationale */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <h2 className="text-sm font-bold text-white tracking-wide uppercase pb-3 border-b border-slate-800">
            Rating Scorecard & Quantitative Thresholds
          </h2>
          <div className="mt-4 space-y-2.5">
            {assessment.ratingRationale.map((bullet, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>{bullet}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
            <div>Rating 1: PD &lt; 1.5%, EL &lt; 0.35%, LTV &lt; 58% (Prime)</div>
            <div className="text-amber-400 font-bold">Rating 2: PD &lt; 3.8%, EL &lt; 1.10%, LTV &lt; 65% (Project Meridian)</div>
            <div>Rating 3: PD &lt; 8.5%, EL &lt; 2.80%, LTV &lt; 72% (Acceptable)</div>
            <div>Rating 4: PD &lt; 16.0%, EL &lt; 6.50% (Watchlist)</div>
            <div>Rating 5: Impaired / Substandard</div>
          </div>
        </div>

        {/* Strengths & Vulnerabilities */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1.5 pb-2 border-b border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Key Credit Strengths
            </h3>
            <ul className="mt-2.5 space-y-1.5 text-xs text-slate-300">
              {assessment.keyStrengths.map((s, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-400">·</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5 pb-2 border-b border-slate-800">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Key Vulnerabilities & Mitigants
            </h3>
            <ul className="mt-2.5 space-y-1.5 text-xs text-slate-300">
              {assessment.keyVulnerabilities.map((v, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-400">·</span>
                  <span>{v}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 4. Macro Sensitivity Grid (Rate Shifts vs Property Value Shifts) */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide uppercase">
              2D Macro Sensitivity Stress Grid (Rate Shifts vs. Property Value Shifts)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Testing Benchmark Shifts (±100bps, ±200bps) against Asset Valuation Declines (0%, -15%, -30%).
            </p>
          </div>

          <div className="text-xs font-mono text-slate-400 flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-950 border border-emerald-600 inline-block" />
              Rating 1-2
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-950 border border-amber-600 inline-block" />
              Rating 3
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-950 border border-rose-600 inline-block" />
              Rating 4-5
            </span>
          </div>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-xs font-mono text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400 text-[11px] border-b border-slate-800">
                <th className="py-2.5 px-4">Rate Shift (bps)</th>
                <th className="py-2.5 px-4">Value Shift %</th>
                <th className="py-2.5 px-4 text-right">5-Yr Stressed PD</th>
                <th className="py-2.5 px-4 text-right">Refi Shortfall</th>
                <th className="py-2.5 px-4 text-right">Implied Loss</th>
                <th className="py-2.5 px-4 text-center">Implied Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {assessment.macroSensitivityGrid.map((row, idx) => {
                let badgeClass = 'text-emerald-400 bg-emerald-950/40 border-emerald-800';
                if (row.impliedRating === 3) badgeClass = 'text-amber-400 bg-amber-950/40 border-amber-800';
                else if (row.impliedRating >= 4) badgeClass = 'text-rose-400 bg-rose-950/50 border-rose-800';

                return (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-4 font-bold text-white">
                      {row.rateShiftBps > 0 ? `+${row.rateShiftBps} bps` : `${row.rateShiftBps} bps`}
                    </td>
                    <td className="py-2.5 px-4 text-slate-300">
                      {row.propertyValueShiftPct > 0 ? `+${row.propertyValueShiftPct}%` : `${row.propertyValueShiftPct}%`}
                    </td>
                    <td className="py-2.5 px-4 text-right tabular-nums text-amber-300 font-semibold">
                      {(row.pd5Yr * 100).toFixed(2)}%
                    </td>
                    <td className="py-2.5 px-4 text-right tabular-nums text-slate-300">
                      {row.refiShortfall > 0 ? `${sym}${(row.refiShortfall / 1e6).toFixed(2)}M` : `${sym}0.00`}
                    </td>
                    <td className="py-2.5 px-4 text-right tabular-nums font-semibold text-slate-200">
                      {row.lossAmount > 0 ? `${sym}${(row.lossAmount / 1e6).toFixed(2)}M` : `${sym}0.00`}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span className={`text-[10px] font-sans font-bold px-2 py-0.5 rounded border ${badgeClass}`}>
                        Rating {row.impliedRating}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
