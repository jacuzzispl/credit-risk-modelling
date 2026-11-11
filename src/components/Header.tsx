/**
 * Top Bar Component
 * Adheres strictly to the frontend design constitution:
 * Single-line Wordmark | Concise nav text links | Single primary action
 */

import React from 'react';
import { Download, FileText, Play, Layers } from 'lucide-react';

export type ActiveTab =
  | 'underwriting'
  | 'monte_carlo'
  | 'rate_caps'
  | 'default_model'
  | 'risk_rating'
  | 'excel_model'
  | 'ic_memo'
  | 'repository';

interface HeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onQuickRunSimulation?: () => void;
  onPrintMemo?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onQuickRunSimulation,
  onPrintMemo,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 text-slate-100 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center font-bold text-slate-950 text-sm shadow-sm">
            CR
          </div>
          <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
            CRE Credit Engine
          </span>
        </div>

        {/* Zone 2: Navigation Links (Clean text links, single-line) */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-medium tracking-wide text-slate-300">
          <button
            onClick={() => onSelectTab('underwriting')}
            className={`whitespace-nowrap transition-colors pb-1 ${
              activeTab === 'underwriting'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            Underwriting
          </button>
          <button
            onClick={() => onSelectTab('monte_carlo')}
            className={`whitespace-nowrap transition-colors pb-1 ${
              activeTab === 'monte_carlo'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            Monte Carlo
          </button>
          <button
            onClick={() => onSelectTab('rate_caps')}
            className={`whitespace-nowrap transition-colors pb-1 ${
              activeTab === 'rate_caps'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            Rate Caps
          </button>
          <button
            onClick={() => onSelectTab('default_model')}
            className={`whitespace-nowrap transition-colors pb-1 ${
              activeTab === 'default_model'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            Cox Default Model
          </button>
          <button
            onClick={() => onSelectTab('risk_rating')}
            className={`whitespace-nowrap transition-colors pb-1 ${
              activeTab === 'risk_rating'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            Risk Rating & EL
          </button>
          <button
            onClick={() => onSelectTab('excel_model')}
            className={`whitespace-nowrap transition-colors pb-1 ${
              activeTab === 'excel_model'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            Excel Reconciliation
          </button>
          <button
            onClick={() => onSelectTab('ic_memo')}
            className={`whitespace-nowrap transition-colors pb-1 ${
              activeTab === 'ic_memo'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            IC Memo (PDF)
          </button>
          <button
            onClick={() => onSelectTab('repository')}
            className={`whitespace-nowrap transition-colors pb-1 ${
              activeTab === 'repository'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            Python Repo & Pitch
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          {activeTab === 'ic_memo' ? (
            <button
              onClick={onPrintMemo}
              className="px-3.5 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors whitespace-nowrap flex items-center gap-1.5 shadow-sm"
            >
              <FileText className="w-3.5 h-3.5" />
              Print / Save IC Memo PDF
            </button>
          ) : (
            <button
              onClick={() => onSelectTab('ic_memo')}
              className="px-3.5 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors whitespace-nowrap flex items-center gap-1.5 shadow-sm"
            >
              <FileText className="w-3.5 h-3.5" />
              View IC Memo
            </button>
          )}
        </div>
      </div>
      
      {/* Mobile subnav */}
      <div className="lg:hidden flex overflow-x-auto px-4 py-2 border-t border-slate-800 gap-4 text-xs">
        {(['underwriting', 'monte_carlo', 'rate_caps', 'default_model', 'risk_rating', 'excel_model', 'ic_memo', 'repository'] as ActiveTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => onSelectTab(tab)}
            className={`whitespace-nowrap shrink-0 py-1 ${activeTab === tab ? 'text-amber-400 font-semibold' : 'text-slate-400'}`}
          >
            {tab.replace('_', ' ').toUpperCase()}
          </button>
        ))}
      </div>
    </header>
  );
};
