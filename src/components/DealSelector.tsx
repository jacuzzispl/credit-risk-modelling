/**
 * Deal Selector & Assumptions Bar
 */

import React from 'react';
import { SAMPLE_DEALS, DealPreset } from '../engine/sampleDeals';
import { PropertyInputs, LoanInputs } from '../types/cre';
import { Building2, SlidersHorizontal, RefreshCw } from 'lucide-react';

interface DealSelectorProps {
  currentDeal: DealPreset;
  property: PropertyInputs;
  loan: LoanInputs;
  onSelectDeal: (deal: DealPreset) => void;
  onUpdateProperty: (updated: Partial<PropertyInputs>) => void;
  onUpdateLoan: (updated: Partial<LoanInputs>) => void;
  onResetDefaults: () => void;
}

export const DealSelector: React.FC<DealSelectorProps> = ({
  currentDeal,
  property,
  loan,
  onSelectDeal,
  onUpdateProperty,
  onUpdateLoan,
  onResetDefaults,
}) => {
  return (
    <div className="bg-slate-900/80 border-b border-slate-800 py-3.5 px-4 sm:px-6 lg:px-8 no-print">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Deal Preset Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            Underwritten Deal:
          </span>
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800">
            {SAMPLE_DEALS.map((deal) => (
              <button
                key={deal.id}
                onClick={() => onSelectDeal(deal)}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-all whitespace-nowrap ${
                  currentDeal.id === deal.id
                    ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {deal.name}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Parameters Strip */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Facility Size:</span>
            <span className="font-mono font-semibold text-slate-100">
              {property.currency === 'GBP' ? '£' : '€'}{(loan.loanAmount / 1e6).toFixed(1)}M
            </span>
          </div>

          <div className="h-3 w-px bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Benchmark ({loan.benchmarkIndex}):</span>
            <input
              type="number"
              step="0.1"
              value={(loan.referenceRate * 100).toFixed(2)}
              onChange={(e) => onUpdateLoan({ referenceRate: parseFloat(e.target.value) / 100 })}
              className="w-16 px-1.5 py-0.5 bg-slate-950 border border-slate-700 rounded text-amber-400 font-mono text-xs focus:outline-none focus:border-amber-400"
            />
            <span className="text-slate-400">%</span>
          </div>

          <div className="h-3 w-px bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Margin:</span>
            <input
              type="number"
              step="5"
              value={Math.round(loan.marginSpread * 10000)}
              onChange={(e) => onUpdateLoan({ marginSpread: parseFloat(e.target.value) / 10000 })}
              className="w-14 px-1.5 py-0.5 bg-slate-950 border border-slate-700 rounded text-amber-400 font-mono text-xs focus:outline-none focus:border-amber-400"
            />
            <span className="text-slate-400">bps</span>
          </div>

          <div className="h-3 w-px bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Rate Cap Strike:</span>
            <input
              type="number"
              step="0.25"
              value={(loan.rateCapStrike * 100).toFixed(2)}
              onChange={(e) => onUpdateLoan({ rateCapStrike: parseFloat(e.target.value) / 100 })}
              className="w-16 px-1.5 py-0.5 bg-slate-950 border border-slate-700 rounded text-amber-400 font-mono text-xs focus:outline-none focus:border-amber-400"
            />
            <span className="text-slate-400">%</span>
          </div>

          <div className="h-3 w-px bg-slate-800 hidden sm:block" />

          <button
            onClick={onResetDefaults}
            title="Reset to deal default assumptions"
            className="p-1 text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
