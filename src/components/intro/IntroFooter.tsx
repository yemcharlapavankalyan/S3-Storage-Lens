import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HardDrive,
  Terminal,
  ArrowRight,
  Cloud,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const IntroFooter: React.FC = () => {
  const navigate = useNavigate();
  const { isAwsConnected, settings } = useApp();

  return (
    <footer className="bg-white dark:bg-[#04060B] border-t border-white/[0.06] text-slate-500 dark:text-slate-400 text-xs py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Column 1: Brand & Purpose */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-sm">
                <HardDrive className="w-4 h-4 text-slate-950" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white text-sm font-display tracking-tight">
                S3 Storage Optimizer
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-sans">
              Amazon S3 Storage Lens for Storage Optimization — an AWS-based approach for monitoring, analysis, and storage optimization.
            </p>
            <div className="pt-1 flex items-center gap-2 text-[11px] font-mono text-slate-500">
              <span className={`w-2 h-2 rounded-full ${isAwsConnected ? 'bg-emerald-400' : 'bg-slate-500'}`} />
              <span>{isAwsConnected ? `Connected (${settings.awsRegion.split(' ')[0]})` : 'Telemetry Standby'}</span>
            </div>
          </div>

          {/* Column 2: Storage Console Modules */}
          <div className="space-y-2.5">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-900 dark:text-white font-semibold">
              Console Modules
            </div>
            <ul className="space-y-1.5 text-slate-500 dark:text-slate-400">
              <li>
                <Link to="/dashboard" className="hover:text-amber-300 transition-colors">
                  Overview Dashboard
                </Link>
              </li>
              <li>
                <Link to="/buckets" className="hover:text-amber-300 transition-colors">
                  Buckets & Encryption
                </Link>
              </li>
              <li>
                <Link to="/analytics" className="hover:text-amber-300 transition-colors">
                  Storage Lens & Prefix Telemetry
                </Link>
              </li>
              <li>
                <Link to="/optimization" className="hover:text-amber-300 transition-colors">
                  Optimization Engine & Ledger
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Advanced Governance */}
          <div className="space-y-2.5">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-900 dark:text-white font-semibold">
              Automation & Infrastructure
            </div>
            <ul className="space-y-1.5 text-slate-500 dark:text-slate-400">
              <li>
                <Link to="/lifecycle" className="hover:text-amber-300 transition-colors">
                  Lifecycle Policy Dispatch
                </Link>
              </li>
              <li>
                <Link to="/cost" className="hover:text-amber-300 transition-colors">
                  Storage Rate Modeling
                </Link>
              </li>
              <li>
                <Link to="/regional-infrastructure" className="hover:text-amber-300 transition-colors">
                  Regional Topology & CRR
                </Link>
              </li>
              <li>
                <Link to="/settings" className="hover:text-amber-300 transition-colors">
                  Settings & AWS Configuration
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Architectural Flow */}
          <div className="space-y-2.5">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-900 dark:text-white font-semibold">
              Architecture Progression
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono leading-relaxed">
              STORE → MONITOR → ANALYZE → OPTIMIZE → AUTOMATE
            </p>
            <div className="pt-2">
              <button
                onClick={() => navigate('/dashboard')}
                className="btn-primary !py-2 !px-3.5 text-xs font-semibold flex items-center gap-1.5"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Launch Console</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Minimal Copyright Bar */}
        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-slate-500">
          <div>
            Amazon S3 Storage Lens for Storage Optimization • AWS-Based Infrastructure
          </div>
          <div>
            Zero synthetic metrics • Deterministic rule evaluation
          </div>
        </div>

      </div>
    </footer>
  );
};

export default IntroFooter;
