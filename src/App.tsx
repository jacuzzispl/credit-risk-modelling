/**
 * @license
 * Commercial Real Estate (CRE) Credit Underwriting & Default Risk Engine
 * Root Application Component
 */

import React, { useState, useMemo, useEffect } from 'react';
import { SAMPLE_DEALS, DealPreset } from './engine/sampleDeals';
import { PropertyInputs, LoanInputs } from './types/cre';
import { runUnderwriting } from './engine/underwriting';
import { runMonteCarloSimulation } from './engine/monteCarlo';
import { Header, ActiveTab } from './components/Header';
import { DealSelector } from './components/DealSelector';
import { UnderwritingView } from './components/UnderwritingView';
import { MonteCarloView } from './components/MonteCarloView';
import { RateCapView } from './components/RateCapView';
import { DefaultModelView } from './components/DefaultModelView';
import { RiskRatingView } from './components/RiskRatingView';
import { ExcelView } from './components/ExcelView';
import { ICMemoView } from './components/ICMemoView';
import { RepoPackagingView } from './components/RepoPackagingView';

export default function App() {
  const [currentDeal, setCurrentDeal] = useState<DealPreset>(SAMPLE_DEALS[0]);
  const [property, setProperty] = useState<PropertyInputs>(SAMPLE_DEALS[0].property);
  const [loan, setLoan] = useState<LoanInputs>(SAMPLE_DEALS[0].loan);
  const [activeTab, setActiveTab] = useState<ActiveTab>('underwriting');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Compute deterministic underwriting summary
  const summary = useMemo(() => {
    return runUnderwriting(property, loan);
  }, [property, loan]);

  // Compute or cache Monte Carlo simulation results
  const [mcResults, setMcResults] = useState(() => {
    return runMonteCarloSimulation(property, loan, { numPaths: 10000, seed: 42 });
  });

  // Re-run simulation when core assumptions shift significantly
  const handleRunSimulation = (customSettings?: any) => {
    setIsSimulating(true);
    setTimeout(() => {
      const res = runMonteCarloSimulation(property, loan, {
        numPaths: 10000,
        seed: Date.now(),
        ...customSettings,
      });
      setMcResults(res);
      setIsSimulating(false);
    }, 50);
  };

  // Switch deal preset
  const handleSelectDeal = (deal: DealPreset) => {
    setCurrentDeal(deal);
    setProperty(deal.property);
    setLoan(deal.loan);
    const newRes = runMonteCarloSimulation(deal.property, deal.loan, { numPaths: 10000, seed: 42 });
    setMcResults(newRes);
  };

  const handleUpdateProperty = (updated: Partial<PropertyInputs>) => {
    setProperty((prev) => ({ ...prev, ...updated }));
  };

  const handleUpdateLoan = (updated: Partial<LoanInputs>) => {
    setLoan((prev) => ({ ...prev, ...updated }));
  };

  const handleResetDefaults = () => {
    setProperty(currentDeal.property);
    setLoan(currentDeal.loan);
    const newRes = runMonteCarloSimulation(currentDeal.property, currentDeal.loan, { numPaths: 10000, seed: 42 });
    setMcResults(newRes);
  };

  const handlePrintMemo = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* 3-Zone Top Navigation Bar */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onPrintMemo={handlePrintMemo}
      />

      {/* Deal Switcher & Quick Assumptions Strip (Hidden in Print) */}
      <DealSelector
        currentDeal={currentDeal}
        property={property}
        loan={loan}
        onSelectDeal={handleSelectDeal}
        onUpdateProperty={handleUpdateProperty}
        onUpdateLoan={handleUpdateLoan}
        onResetDefaults={handleResetDefaults}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 pb-16">
        {activeTab === 'underwriting' && (
          <UnderwritingView
            summary={summary}
            onUpdateProperty={handleUpdateProperty}
            onUpdateLoan={handleUpdateLoan}
          />
        )}

        {activeTab === 'monte_carlo' && (
          <MonteCarloView
            property={property}
            loan={loan}
            mcResults={mcResults}
            onRunSimulation={handleRunSimulation}
            isRunning={isSimulating}
          />
        )}

        {activeTab === 'rate_caps' && (
          <RateCapView
            property={property}
            loan={loan}
            onUpdateLoan={handleUpdateLoan}
          />
        )}

        {activeTab === 'default_model' && (
          <DefaultModelView
            property={property}
            loan={loan}
            monteCarloBreachProb={mcResults.covenantBreachProbability}
          />
        )}

        {activeTab === 'risk_rating' && (
          <RiskRatingView
            summary={summary}
            shortfallProb={mcResults.refinancingShortfallProbability}
            expectedLossPct={mcResults.expectedLossPercent}
          />
        )}

        {activeTab === 'excel_model' && (
          <ExcelView summary={summary} />
        )}

        {activeTab === 'ic_memo' && (
          <ICMemoView
            summary={summary}
            mcResults={mcResults}
            onPrintMemo={handlePrintMemo}
          />
        )}

        {activeTab === 'repository' && (
          <RepoPackagingView />
        )}
      </main>

      {/* Clean Institutional Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-500 text-center no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Commercial Real Estate Credit Underwriting & Default Risk Engine · European Debt Platform
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Deterministic DCF</span>
            <span>·</span>
            <span>Cholesky Monte Carlo</span>
            <span>·</span>
            <span>Cox Survival Model</span>
            <span>·</span>
            <span>Excel Reconciled</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
