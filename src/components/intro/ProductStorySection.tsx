import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Database,
  Search,
  Sliders,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ProductStorySection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section id="story" className="relative py-20 lg:py-28 bg-white dark:bg-[#080C14] border-b border-white/[0.07] overflow-hidden scroll-mt-20">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-amber-500/[0.03] blur-3xl pointer-events-none rounded-full" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 font-mono text-[11px] font-semibold tracking-wider uppercase">
            Product Philosophy
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight leading-tight">
            Storage grows faster than visibility.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-sans leading-relaxed">
            Amazon S3 can scale across buckets, objects, storage classes, and regions, making it difficult to understand where storage is being consumed and where optimization opportunities exist.
          </p>
          <div className="pt-2">
            <span className="inline-block text-base sm:text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400 font-display">
              S3 Storage Optimizer brings monitoring, analysis, and optimization into one workflow.
            </span>
          </div>
        </div>

        {/* Editorial Architecture Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          
          {/* Left: The Storage Challenge */}
          <div className="p-8 rounded-lg bg-slate-900/40 border border-red-500/20 shadow-card flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white font-mono uppercase tracking-wider">
                      The Visibility Gap
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Unmonitored Multi-Bucket Scale</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                  Compounding Overhead
                </span>
              </div>

              <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-white/[0.04] space-y-1">
                  <div className="font-semibold text-slate-200 font-mono">Dormant Data in Standard Tier</div>
                  <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                    S3 inventory provides a point-in-time view. Access frequency is unavailable unless AWS reports authoritative activity metrics.
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-white/[0.04] space-y-1">
                  <div className="font-semibold text-slate-200 font-mono">Prefix Sprawl & Blind Spots</div>
                  <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                    Application uploads generate nested prefixes (`raw/`, `tmp/`, `backups/`) without automated transition criteria.
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-white/[0.04] space-y-1">
                  <div className="font-semibold text-slate-200 font-mono">Unmanaged Object Versions</div>
                  <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                    Noncurrent versions and incomplete multipart uploads persist unobserved, silently driving up storage charges.
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/[0.06] text-[11px] font-mono text-slate-500 flex items-center justify-between">
              <span>Risk: Silent cost growth</span>
              <span className="text-red-400/80">Static Tiering</span>
            </div>
          </div>

          {/* Right: The S3 Storage Optimizer Solution */}
          <div className="p-8 rounded-lg bg-gradient-to-b from-[#0F1626] to-[#0A0E1A] border border-amber-500/30 shadow-glowSm flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white font-mono uppercase tracking-wider">
                      The Unified S3 Solution
                    </h3>
                    <p className="text-xs text-amber-300/80">Observed data & reviewed actions</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Estimated comparisons
                </span>
              </div>

              <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-white/[0.08] space-y-1">
                  <div className="font-semibold text-amber-300 font-mono flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-amber-400" />
                    <span>Native S3 Storage Lens Telemetry</span>
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                    Shows AWS Storage Lens configuration and published metrics when available. Direct S3 inventory is identified separately.
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-white/[0.08] space-y-1">
                  <div className="font-semibold text-cyan-300 font-mono flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Deterministic Candidate Ledger</span>
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                    Surfaces review candidates from available inventory evidence; cost impact remains an estimate and access frequency is not inferred.
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-white/[0.08] space-y-1">
                  <div className="font-semibold text-emerald-300 font-mono flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Lifecycle Policy Review</span>
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                    Reviews lifecycle policy details. Live bucket policy changes require an explicit operator action and AWS confirmation.
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/[0.06] flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">Result: Auditable efficiency</span>
              <button
                onClick={() => navigate('/optimization')}
                className="text-xs font-mono font-semibold text-amber-300 hover:text-amber-200 flex items-center gap-1 transition-colors"
              >
                <span>Inspect Engine</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default ProductStorySection;
