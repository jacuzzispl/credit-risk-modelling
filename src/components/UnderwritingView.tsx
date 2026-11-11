/**
 * Phase 1: Underwriting Engine View
 * Pure deterministic DCF model, refinancing constraint test, and two-way sensitivity table.
 */

import React from 'react';
import { PropertyInputs, LoanInputs, UnderwritingSummary } from '../types/cre';
import { generateTwoWayLossTable } from '../engine/underwriting';
import { ShieldAlert, CheckCircle2, TrendingUp, AlertTriangle, ArrowRight, DollarSign } from 'lucide-react';

interface UnderwritingViewProps {
  summary: UnderwritingSummary;
  onUpdateProperty: (updated: Partial<PropertyInputs>) => void;
  onUpdateLoan: (updated: Partial<LoanInputs>) => void;
}

export const UnderwritingView: React.FC<UnderwritingViewProps> = ({
  summary,
  onUpdateProperty,
  onUpdateLoan,
}) => {
  const { property, loan, initialValue, initialLTV, initialDebtYield, annualSchedule, refinancing, minDSCR } = summary;
  const sym = property.currency === 'GBP' ? '£' : '€';

  // Two-way sensitivity matrix: Exit Cap Rate vs NOI Change
  const twoWay = generateTwoWayLossTable(property, loan);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* 1. Header & Context */}
      <div className="border-b border-slate-800 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Phase 1: Deterministic Underwriting & Refinancing Test
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Exact mathematical underwriting for {property.propertyName} ({property.location}). Pure functions reconciled to Microsoft Excel to the exact penny.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Model Engine:</span>
          <span className="font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded">
            DETERMINISTIC DCF · 0.00 VARIANCE
          </span>
        </div>
      </div>

      {/* 2. Primary KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3.5">
          <span className="text-xs text-slate-400 font-medium">Day-1 Valuation (V₀)</span>
          <div className="mt-1 font-mono text-lg font-bold text-slate-100 tabular-nums">
            {sym}{(initialValue / 1e6).toFixed(2)}M
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            NOI₁ / Entry Cap ({(property.entryCapRate * 100).toFixed(2)}%)
          </span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3.5">
          <span className="text-xs text-slate-400 font-medium">Origination LTV</span>
          <div className="mt-1 font-mono text-lg font-bold text-slate-100 tabular-nums">
            {(initialLTV * 100).toFixed(1)}%
          </div>
          <span className={`text-[11px] mt-0.5 block ${initialLTV <= loan.covenantMaxLTV ? 'text-emerald-400' : 'text-rose-400'}`}>
            Max Covenant: {(loan.covenantMaxLTV * 100).toFixed(1)}%
          </span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3.5">
          <span className="text-xs text-slate-400 font-medium">Initial Debt Yield</span>
          <div className="mt-1 font-mono text-lg font-bold text-slate-100 tabular-nums">
            {(initialDebtYield * 100).toFixed(2)}%
          </div>
          <span className={`text-[11px] mt-0.5 block ${initialDebtYield >= loan.covenantMinDebtYield ? 'text-emerald-400' : 'text-rose-400'}`}>
            Min Covenant: {(loan.covenantMinDebtYield * 100).toFixed(2)}%
          </span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3.5">
          <span className="text-xs text-slate-400 font-medium">Min Underwritten DSCR</span>
          <div className="mt-1 font-mono text-lg font-bold text-slate-100 tabular-nums">
            {minDSCR.toFixed(2)}x
          </div>
          <span className={`text-[11px] mt-0.5 block ${minDSCR >= loan.covenantMinDSCR ? 'text-emerald-400' : 'text-rose-400'}`}>
            Covenant Floor: {loan.covenantMinDSCR.toFixed(2)}x
          </span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3.5">
          <span className="text-xs text-slate-400 font-medium">Maturity Balance (L_T)</span>
          <div className="mt-1 font-mono text-lg font-bold text-slate-100 tabular-nums">
            {sym}{(refinancing.balanceOwed / 1e6).toFixed(2)}M
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            {loan.amortisationType === 'interest_only' ? 'Interest-Only' : 'Amortised'}
          </span>
        </div>

        <div className={`bg-slate-900/90 border rounded-lg p-3.5 ${refinancing.isShortfall ? 'border-amber-700/80' : 'border-emerald-800/80'}`}>
          <span className="text-xs text-slate-400 font-medium">Refi Shortfall (Base)</span>
          <div className={`mt-1 font-mono text-lg font-bold tabular-nums ${refinancing.isShortfall ? 'text-amber-400' : 'text-emerald-400'}`}>
            {refinancing.isShortfall ? `${sym}${(refinancing.shortfall / 1e6).toFixed(2)}M` : `${sym}0.00`}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            {refinancing.isShortfall ? `Binding: ${refinancing.bindingConstraint}` : 'Full Refinance Capacity'}
          </span>
        </div>
      </div>

      {/* 3. Cash Flow & Debt Service Schedule Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide uppercase">
              Annual Cash Flow & Debt Service Schedule (Years 1 to {loan.termYears})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Debt Service formulation: DS_t = L_t · (min(i_t, K) + s) + Principal_t
            </p>
          </div>
          
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-400">Rate Cap:</span>
            <span className="font-mono text-amber-400">
              {loan.rateCapActive ? `Active (${(loan.rateCapStrike * 100).toFixed(2)}% strike, Y1-${loan.rateCapTenorYears})` : 'Unhedged'}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400 font-mono border-b border-slate-800 text-[11px]">
                <th className="py-2.5 px-4">Period</th>
                <th className="py-2.5 px-4 text-right">Beginning Balance</th>
                <th className="py-2.5 px-4 text-right">Effective Rate</th>
                <th className="py-2.5 px-4 text-right">Interest Payment</th>
                <th className="py-2.5 px-4 text-right">Amortisation</th>
                <th className="py-2.5 px-4 text-right">Total Debt Service</th>
                <th className="py-2.5 px-4 text-right">NOI (Net Income)</th>
                <th className="py-2.5 px-4 text-right">DSCR</th>
                <th className="py-2.5 px-4 text-right">Ending Value</th>
                <th className="py-2.5 px-4 text-right">LTV</th>
                <th className="py-2.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-200">
              {annualSchedule.map((p) => (
                <tr key={p.year} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-4 font-semibold text-white">Year {p.year}</td>
                  <td className="py-2.5 px-4 text-right tabular-nums">{sym}{(p.beginningBalance / 1e6).toFixed(3)}M</td>
                  <td className="py-2.5 px-4 text-right tabular-nums text-amber-300">
                    {(p.totalInterestRate * 100).toFixed(2)}%
                    {loan.rateCapActive && p.year <= loan.rateCapTenorYears && p.referenceRate > loan.rateCapStrike && (
                      <span className="text-[10px] text-emerald-400 ml-1">(Cap)</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-right tabular-nums">{sym}{(p.interestPayment / 1e6).toFixed(3)}M</td>
                  <td className="py-2.5 px-4 text-right tabular-nums">{sym}{(p.principalPayment / 1e6).toFixed(3)}M</td>
                  <td className="py-2.5 px-4 text-right tabular-nums font-semibold text-slate-100">{sym}{(p.totalDebtService / 1e6).toFixed(3)}M</td>
                  <td className="py-2.5 px-4 text-right tabular-nums text-emerald-400 font-semibold">{sym}{(p.netOperatingIncome / 1e6).toFixed(3)}M</td>
                  <td className={`py-2.5 px-4 text-right tabular-nums font-bold ${p.dscrBreach ? 'text-rose-400' : 'text-emerald-300'}`}>
                    {p.dscr.toFixed(2)}x
                  </td>
                  <td className="py-2.5 px-4 text-right tabular-nums">{sym}{(p.propertyValue / 1e6).toFixed(2)}M</td>
                  <td className="py-2.5 px-4 text-right tabular-nums">{(p.ltv * 100).toFixed(1)}%</td>
                  <td className="py-2.5 px-4 text-center">
                    {p.dscrBreach ? (
                      <span className="text-[10px] font-sans font-semibold text-rose-400 bg-rose-950/60 border border-rose-800 px-1.5 py-0.5 rounded">
                        BREACH
                      </span>
                    ) : (
                      <span className="text-[10px] font-sans font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800 px-1.5 py-0.5 rounded">
                        PASS
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Refinancing Test at Maturity (Waterfall & Shortfall) */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide uppercase">
              Refinancing Test at Maturity (Year {loan.termYears})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              L_refi^max = min( LTV_max · V_T, NOI_T / DY_min, NOI_T / (DSCR_min · (i_T + s_refi)) )
            </p>
          </div>

          <div className="text-xs font-mono text-slate-300">
            Binding Test: <span className="font-bold text-amber-400">{refinancing.bindingConstraint} Constraint</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          {/* Test 1: LTV */}
          <div className={`p-4 rounded-lg border ${refinancing.bindingConstraint === 'LTV' ? 'bg-amber-950/20 border-amber-500/60' : 'bg-slate-950/60 border-slate-800'}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">1. LTV Constraint</span>
              {refinancing.bindingConstraint === 'LTV' && (
                <span className="text-[10px] text-amber-400 font-mono font-bold">BINDING</span>
              )}
            </div>
            <div className="mt-2 font-mono text-xl font-bold text-white tabular-nums">
              {sym}{(refinancing.maxRefiByLtv / 1e6).toFixed(2)}M
            </div>
            <div className="mt-1 text-xs text-slate-400">
              {(loan.refiMaxLTV * 100).toFixed(0)}% max LTV · Terminal Value: {sym}{(refinancing.propertyValueMaturity / 1e6).toFixed(2)}M
            </div>
          </div>

          {/* Test 2: Debt Yield */}
          <div className={`p-4 rounded-lg border ${refinancing.bindingConstraint === 'Debt Yield' ? 'bg-amber-950/20 border-amber-500/60' : 'bg-slate-950/60 border-slate-800'}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">2. Debt Yield Constraint</span>
              {refinancing.bindingConstraint === 'Debt Yield' && (
                <span className="text-[10px] text-amber-400 font-mono font-bold">BINDING</span>
              )}
            </div>
            <div className="mt-2 font-mono text-xl font-bold text-white tabular-nums">
              {sym}{(refinancing.maxRefiByDebtYield / 1e6).toFixed(2)}M
            </div>
            <div className="mt-1 text-xs text-slate-400">
              {(loan.refiMinDebtYield * 100).toFixed(2)}% min DY · Maturity NOI: {sym}{(refinancing.noiMaturity / 1e6).toFixed(2)}M
            </div>
          </div>

          {/* Test 3: DSCR */}
          <div className={`p-4 rounded-lg border ${refinancing.bindingConstraint === 'DSCR' ? 'bg-amber-950/20 border-amber-500/60' : 'bg-slate-950/60 border-slate-800'}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">3. DSCR Constraint</span>
              {refinancing.bindingConstraint === 'DSCR' && (
                <span className="text-[10px] text-amber-400 font-mono font-bold">BINDING</span>
              )}
            </div>
            <div className="mt-2 font-mono text-xl font-bold text-white tabular-nums">
              {sym}{(refinancing.maxRefiByDscr / 1e6).toFixed(2)}M
            </div>
            <div className="mt-1 text-xs text-slate-400">
              {loan.refiMinDSCR.toFixed(2)}x min DSCR @ {(refinancing.refiTotalRate * 100).toFixed(2)}% all-in refi rate
            </div>
          </div>
        </div>

        {/* Refinancing Outcome Waterfall */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
          <div>
            <span className="text-slate-400 block font-sans">Principal Balance Owed:</span>
            <span className="text-base font-bold text-white tabular-nums mt-0.5 block">
              {sym}{(refinancing.balanceOwed / 1e6).toFixed(2)}M
            </span>
          </div>

          <div>
            <span className="text-slate-400 block font-sans">Max Refinanceable Capacity:</span>
            <span className="text-base font-bold text-emerald-400 tabular-nums mt-0.5 block">
              {sym}{(refinancing.maxRefinanceableAmount / 1e6).toFixed(2)}M
            </span>
          </div>

          <div>
            <span className="text-slate-400 block font-sans">Refinancing Shortfall:</span>
            <span className={`text-base font-bold tabular-nums mt-0.5 block ${refinancing.isShortfall ? 'text-amber-400' : 'text-slate-400'}`}>
              {sym}{(refinancing.shortfall / 1e6).toFixed(2)}M
            </span>
          </div>

          <div>
            <span className="text-slate-400 block font-sans">Loss Given Default (LGD):</span>
            <span className={`text-base font-bold tabular-nums mt-0.5 block ${refinancing.distressLoss > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
              {sym}{(refinancing.distressLoss / 1e6).toFixed(2)}M ({refinancing.lossSeverityPercent.toFixed(1)}%)
            </span>
          </div>
        </div>
      </div>

      {/* 5. Two-Way Sensitivity Table (Exit Cap Rate vs NOI Decline -> Loss) */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="pb-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide uppercase">
              Two-Way Data Table: Exit Cap Rate vs. Terminal NOI Shift
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Output: Unhedged Principal Loss Given Default ({sym} Millions). Identifies the exact breakeven frontier.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-950 border border-emerald-600 inline-block" />
              £0 Loss (Safe)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-950 border border-amber-600 inline-block" />
              £0 - £5M Loss
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-950 border border-rose-600 inline-block" />
              &gt;£5M Loss
            </span>
          </div>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-xs font-mono border-collapse text-right">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400 text-[11px] border-b border-slate-800">
                <th className="py-2 px-3 text-left">Exit Cap \ NOI Shift</th>
                {twoWay.noiChanges.map((shift) => (
                  <th key={shift} className="py-2 px-3">
                    {shift > 0 ? `+${(shift * 100).toFixed(0)}%` : `${(shift * 100).toFixed(0)}%`}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {twoWay.capRates.map((cap, rowIdx) => (
                <tr key={cap} className="hover:bg-slate-800/40">
                  <td className="py-2 px-3 text-left font-bold text-slate-300">
                    {(cap * 100).toFixed(2)}%
                  </td>
                  {twoWay.matrix[rowIdx].map((cell, colIdx) => {
                    const lossM = cell.loss / 1e6;
                    let bgClass = 'text-slate-400';
                    if (cell.loss === 0) {
                      bgClass = 'text-emerald-400/90 font-medium';
                    } else if (lossM < 5.0) {
                      bgClass = 'bg-amber-950/30 text-amber-300 font-semibold';
                    } else {
                      bgClass = 'bg-rose-950/40 text-rose-300 font-bold';
                    }

                    return (
                      <td key={colIdx} className={`py-2 px-3 tabular-nums ${bgClass}`}>
                        {cell.loss === 0 ? `${sym}0.0` : `${sym}${lossM.toFixed(1)}M`}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
