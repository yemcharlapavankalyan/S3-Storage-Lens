import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Layers,
  Database,
  ShieldCheck,
  Workflow,
  Server,
  Cloud,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const { settings } = useApp();
  const [activeTierHover, setActiveTierHover] = useState<string>('Standard');

  const tiers = [
    {
      name: 'Standard',
      role: 'Active Ingestion & Fast Access',
      price: 'Rate varies by region',
      accent: 'border-blue-500/40 text-blue-400 bg-blue-500/10',
      dot: 'bg-blue-400',
    },
    {
      name: 'Infrequent Access',
      role: 'Review retrieval and duration needs',
      price: 'Rate varies by region',
      accent: 'border-amber-500/40 text-amber-400 bg-amber-500/10',
      dot: 'bg-amber-400',
    },
    {
      name: 'Glacier Flexible',
      role: 'Evaluate archival access requirements',
      price: 'Rate varies by region',
      accent: 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10',
      dot: 'bg-cyan-400',
    },
  ];

  return (
    <section className="relative pt-10 pb-20 lg:pt-16 lg:pb-24 overflow-hidden border-b border-white/[0.07]">
      {/* Background Architectural Grid & Subtle Infrastructure Nodes */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 cloud-grid opacity-25" />
        <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-gradient-to-tr from-amber-500/8 via-blue-500/5 to-transparent blur-3xl rounded-full" />
        <div className="absolute top-10 right-1/4 w-[500px] h-[300px] bg-gradient-to-bl from-indigo-500/6 via-amber-500/4 to-transparent blur-3xl rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Core Positioning & Concise Copy */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Minimal Technical Identifier */}
            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-900/90 border border-white/[0.09] text-xs font-mono text-slate-600 dark:text-slate-300 backdrop-blur-md">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
              <span className="text-amber-300 font-semibold tracking-wider uppercase text-[11px]">
                AWS S3 Storage Lens
              </span>
              <span className="text-slate-600">/</span>
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                Storage Optimization System
              </span>
            </div>

            {/* Product Title & Main Headline */}
            <div className="space-y-3">
              <div className="text-xs uppercase font-mono tracking-widest text-slate-500 dark:text-slate-400 font-semibold">
                S3 Storage Optimizer
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display leading-[1.08]">
                Turn S3 storage data{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400">
                  into decisions.
                </span>
              </h1>
            </div>

            {/* Supporting Message - Concise and Direct as Requested */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-sans max-w-2xl">
              Monitor S3 storage. Understand usage. Identify optimization opportunities. Improve storage-class and lifecycle strategies.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                id="cta-explore-storage-console"
                className="btn-primary !py-3.5 !px-6 text-xs sm:text-sm font-bold shadow-glow hover:shadow-glowSm flex items-center gap-2.5 group"
              >
                <span>Explore Storage Console</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => {
                  document.getElementById('architecture')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="btn-secondary !py-3.5 !px-5 text-xs font-semibold flex items-center gap-2 cursor-pointer"
              >
                <Layers className="w-4 h-4 text-blue-400" />
                <span>View Architecture</span>
              </button>
            </div>

            {/* Quiet Infrastructure Anchor Notes */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs font-mono text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Cloud className="w-3.5 h-3.5 text-slate-500" />
                <span>Storage Lens: AWS-published metrics</span>
              </div>
              <div className="flex items-center gap-2">
                <Workflow className="w-3.5 h-3.5 text-slate-500" />
                <span>Actions: Declarative S3 Lifecycle</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                <span>Safety: Dry-Run Auditing</span>
              </div>
            </div>
          </div>

          {/* Right Column: Atmospheric Cloud-Infrastructure Composition */}
          <div className="lg:col-span-5 relative">
            <div className="aws-card relative p-6 rounded-lg">
              
              {/* Atmospheric Header Bar */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-slate-700 text-xs font-mono">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Database className="w-4 h-4 text-amber-400" />
                  <span className="font-semibold text-slate-900 dark:text-white">S3 Object Pipeline</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  <span>Inventory-based review</span>
                </div>
              </div>

              {/* Connected Infrastructure Visual Flow */}
              <div className="space-y-4">
                {/* Visual Storage Tier Spectrum */}
                <div className="space-y-2.5">
                  <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Storage Class Progression</span>
                    <span className="text-amber-400/90 text-[10px]">Differential Economics</span>
                  </div>

                  <div className="space-y-2">
                    {tiers.map((tier) => {
                      const isHovered = activeTierHover === tier.name;
                      return (
                        <div
                          key={tier.name}
                          onMouseEnter={() => setActiveTierHover(tier.name)}
                          className={`p-3 rounded-lg border transition-all cursor-pointer ${
                            isHovered
                              ? `${tier.accent} scale-[1.01]`
                              : 'border-slate-200 bg-slate-50 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-50 dark:bg-slate-900/50 dark:hover:border-slate-600'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${tier.dot}`} />
                              <span className="text-xs font-semibold text-slate-900 dark:text-white font-mono">
                                {tier.name}
                              </span>
                            </div>
                            <span className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300">
                              {tier.price}
                            </span>
                          </div>
                          <div className="mt-1 text-[11px] text-slate-600 dark:text-slate-400 font-sans">
                            {tier.role}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Infrastructure Connection Diagram Path */}
                <div className="p-3.5 rounded-md bg-slate-50 dark:bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-2 font-mono text-[11px]">
                  <div className="text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                    <Server className="w-3 h-3 text-cyan-400" />
                    <span>Pipeline Progression</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 py-1 px-1">
                    <span className="text-blue-400">Inventory evidence</span>
                    <span className="text-slate-600">→</span>
                    <span className="text-amber-400">Prefix analysis</span>
                    <span className="text-slate-600">→</span>
                    <span className="text-emerald-400">Lifecycle Rule</span>
                  </div>

                  <div className="pt-1 border-t border-white/[0.05] text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                    <span>Target Region: {settings.awsRegion.split(' ')[0]}</span>
                    <span className="text-emerald-400">Deterministic Policy</span>
                  </div>
                </div>
              </div>

              {/* Subtle Corner Ambient Aura */}
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-amber-500/10 blur-2xl rounded-full pointer-events-none" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
