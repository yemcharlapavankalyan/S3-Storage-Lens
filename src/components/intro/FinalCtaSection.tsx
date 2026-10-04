import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Layers, Terminal, Cloud, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const FinalCtaSection: React.FC = () => {
  const navigate = useNavigate();
  const { isAwsConnected, settings } = useApp();

  return (
    <section className="relative py-24 lg:py-32 bg-gradient-to-b from-[#080C14] to-[#04060B] overflow-hidden border-b border-white/[0.08]">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-amber-500/10 via-blue-500/5 to-transparent blur-3xl rounded-full" />
        <div className="absolute inset-0 cloud-grid opacity-15" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        
        {/* Minimal Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-white/[0.09] text-xs font-mono text-slate-600 dark:text-slate-300">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="text-amber-300 font-semibold uppercase text-[11px] tracking-wider">
            S3 Storage Optimizer
          </span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-500 dark:text-slate-400 text-[11px]">
            {isAwsConnected ? `AWS ${settings.awsRegion.split(' ')[0]}` : 'Telemetry Console'}
          </span>
        </div>

        {/* Primary Statement */}
        <div className="space-y-4">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight leading-tight">
            See your storage clearly.
          </h2>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 font-sans max-w-2xl mx-auto">
            Move from S3 visibility to measurable storage decisions.
          </p>
        </div>

        {/* Action CTAs */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            id="cta-open-console-final"
            className="btn-primary !py-3.5 !px-7 text-sm font-bold shadow-glow hover:shadow-glowSm flex items-center gap-2.5 w-full sm:w-auto justify-center group"
          >
            <Terminal className="w-4 h-4" />
            <span>Open Storage Console</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>

          <button
            onClick={() => {
              document.getElementById('architecture')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="btn-secondary !py-3.5 !px-6 text-xs sm:text-sm font-semibold flex items-center gap-2 w-full sm:w-auto justify-center cursor-pointer"
          >
            <Layers className="w-4 h-4 text-blue-400" />
            <span>Explore Architecture</span>
          </button>
        </div>

        {/* Subtle Assurance Row */}
        <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-slate-500">
          <div className="flex items-center gap-1.5">
            <Cloud className="w-3.5 h-3.5 text-slate-500" />
            <span>Zero Agent Overhead</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
            <span>Dry-Run Safe Lifecycle Dispatch</span>
          </div>
          <span>•</span>
          <div>Auditable Approval Ledger</div>
        </div>

      </div>
    </section>
  );
};

export default FinalCtaSection;
