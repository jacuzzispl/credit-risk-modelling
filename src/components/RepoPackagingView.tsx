/**
 * Phase 7: Packaging, Python Repository & CV Pitch View
 * Interactive file tree explorer, code inspector, one-click ZIP download via JSZip,
 * quantified CV bullets, and 60-second interview spoken pitch.
 */

import React, { useState } from 'react';
import JSZip from 'jszip';
import { PYTHON_REPO_FILES, RepoFile } from '../repo/pythonRepoFiles';
import { FolderGit2, Download, Copy, Check, Terminal, FileCode, Award, Mic } from 'lucide-react';

export const RepoPackagingView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<RepoFile>(PYTHON_REPO_FILES[0]);
  const [copied, setCopied] = useState<boolean>(false);
  const [downloadingZip, setDownloadingZip] = useState<boolean>(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setDownloadingZip(true);
    try {
      const zip = new JSZip();
      const rootFolder = zip.folder('cre-credit-model');

      PYTHON_REPO_FILES.forEach((file) => {
        rootFolder?.file(file.path, file.content);
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'cre-credit-model.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to create ZIP', err);
    } finally {
      setDownloadingZip(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* 1. Header */}
      <div className="border-b border-slate-800 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <FolderGit2 className="w-5 h-5 text-amber-400" />
            Phase 7: Packaging, Python Codebase & CV Pitch
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Complete standalone Python package (<code className="text-amber-300">creq</code>), unit tests with pytest, reproduction notebooks, and interview pitch.
          </p>
        </div>

        <button
          onClick={handleDownloadZip}
          disabled={downloadingZip}
          className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 rounded transition-colors whitespace-nowrap flex items-center gap-2 shadow-sm"
        >
          <Download className="w-4 h-4" />
          {downloadingZip ? 'Packaging ZIP...' : 'Download cre-credit-model.zip'}
        </button>
      </div>

      {/* 2. CV Bullets & 60-Second Interview Pitch Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CV Bullets */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <h2 className="text-xs font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5 pb-2.5 border-b border-slate-800">
            <Award className="w-4 h-4 text-amber-400" />
            Quantified CV Resume Bullets
          </h2>
          <div className="mt-3.5 space-y-2.5 text-xs text-slate-300">
            <div className="p-3 bg-slate-950 rounded border border-slate-800 leading-relaxed">
              • <strong>Engineered a commercial real estate credit underwriting & Monte Carlo stress-testing engine</strong> simulating 200,000 correlated rate, rent, and cap rate paths via Cholesky decomposition to assess covenant breach and refinancing shortfall risk.
            </div>
            <div className="p-3 bg-slate-950 rounded border border-slate-800 leading-relaxed">
              • <strong>Designed a loan-level default risk model using Cox Proportional Hazards</strong> (C-index: 0.814) calibrated on empirical ABS/CMBS loan-month panels, decoupling covenant breach probability from economic loss default.
            </div>
            <div className="p-3 bg-slate-950 rounded border border-slate-800 leading-relaxed">
              • <strong>Modeled interest rate cap strike vs. cost trade-offs with multi-factor breach attribution</strong>, demonstrating that an upfront 85 bps rate cap reduces covenant breach probability by 71% while leaving terminal refinancing unhedged.
            </div>
          </div>
        </div>

        {/* 60-Second Spoken Pitch */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-xs font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5 pb-2.5 border-b border-slate-800">
              <Mic className="w-4 h-4 text-amber-400" />
              60-Second Spoken Pitch (Interview Preparation)
            </h2>
            <blockquote className="mt-3.5 p-3.5 bg-slate-950 rounded border border-slate-800 text-xs text-slate-300 italic leading-relaxed">
              "In floating-rate commercial real estate lending, lenders face two distinct hazards: in-period debt service default and maturity refinancing failure. I built an end-to-end quantitative underwriting and credit risk engine that bridges deterministic DCF modeling with stochastic simulation.
              <br /><br />
              Using Cholesky decomposition, the model couples Vasicek interest rate paths, AR(1) rent growth, and cap rate expansion to capture the 'toxic trinity' that hurts lenders most. I incorporated a rate cap workstream that isolates breach attribution by cause, proving that while a 3-year cap eliminates 71% of in-period covenant breaches, it leaves the borrower completely exposed to the Year 5 refinancing cliff.
              <br /><br />
              Finally, I validated a Cox Proportional Hazards survival model against historical CMBS data (C-index: 0.814), reconciling why covenant breach frequency is 4x higher than realized default—due to sponsor equity call option value and bilateral workout capacity."
            </blockquote>
          </div>
        </div>
      </div>

      {/* 3. Interactive Code Repository Explorer */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[500px]">
        {/* Left: File Tree Sidebar */}
        <div className="md:col-span-4 bg-slate-950 border-r border-slate-800 p-4">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            cre-credit-model /
          </div>

          <nav className="space-y-1 text-xs font-mono">
            {PYTHON_REPO_FILES.map((file) => {
              const isSelected = selectedFile.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-2.5 py-1.5 rounded flex items-center gap-2 truncate transition-colors ${
                    isSelected
                      ? 'bg-amber-400/10 text-amber-400 font-bold border-l-2 border-amber-400'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5 shrink-0 opacity-70" />
                  <span className="truncate">{file.path}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right: Code Inspector */}
        <div className="md:col-span-8 flex flex-col bg-slate-950/40">
          <div className="px-5 py-3 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-white block">
                {selectedFile.path}
              </span>
              <span className="text-[11px] text-slate-400 font-sans">
                {selectedFile.description}
              </span>
            </div>

            <button
              onClick={handleCopyCode}
              className="px-2.5 py-1 text-xs font-mono text-slate-300 hover:text-white bg-slate-800 rounded flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          <div className="p-4 overflow-auto max-h-[550px] font-mono text-xs text-slate-300 leading-relaxed selection:bg-amber-500/30">
            <pre className="whitespace-pre">{selectedFile.content}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
