import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Globe,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  GitFork,
  Radio,
  Server,
  CloudRain,
  Activity,
} from 'lucide-react';

export const RegionalPreview: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section id="infrastructure" className="py-20 border-b border-white/[0.08] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono font-medium mb-3">
              <Globe className="w-3.5 h-3.5" />
              <span>Multi-Region AWS Topology</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white font-display tracking-tight">
              Regional Infrastructure & CRR Topology
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base mt-2 leading-relaxed">
              Geographic footprint mapping across AWS data centers with active Cross-Region Replication
              (CRR) paths and disaster recovery failover readiness evaluation.
            </p>
          </div>

          <button
            onClick={() => navigate('/regional-infrastructure')}
            className="btn-primary !py-2.5 !px-4 text-xs font-semibold shrink-0 flex items-center gap-2"
          >
            <span>Open Interactive World Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Regional Topology Visual Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Primary Region: ap-south-2 Hyderabad */}
          <div className="aws-card p-6 rounded-lg border-white/[0.1] bg-white dark:bg-[#0F1626]/90 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                PRIMARY REGION
              </span>
            </div>

            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Server className="w-5 h-5" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                  Asia Pacific (Hyderabad)
                </h3>
                <p className="text-xs font-mono text-amber-400 mt-0.5">
                  ap-south-2 • AWS India
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/[0.06] text-xs">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span className="text-slate-500 dark:text-slate-400">Monitored Bucket:</span>
                  <span className="font-mono text-slate-900 dark:text-white font-semibold">salarybox-uploads-2026</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span className="text-slate-500 dark:text-slate-400">Primary Role:</span>
                  <span className="text-slate-200">Active Ingestion & Primary Store</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span className="text-slate-500 dark:text-slate-400">Replication Source:</span>
                  <span className="text-emerald-400 font-mono font-bold">CRR Active</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-[#080C14] border border-white/[0.06] text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>Lat: 17.3850° N</span>
                <span>Long: 78.4867° E</span>
              </div>
            </div>
          </div>

          {/* Secondary Replica: us-west-1 California */}
          <div className="aws-card p-6 rounded-lg border-white/[0.1] bg-white dark:bg-[#0F1626]/90 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold flex items-center gap-1">
                <GitFork className="w-3 h-3" />
                REPLICA TARGET
              </span>
            </div>

            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <GitFork className="w-5 h-5" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                  US West (N. California)
                </h3>
                <p className="text-xs font-mono text-blue-400 mt-0.5">
                  us-west-1 / us-east-1 • AWS North America
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/[0.06] text-xs">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span className="text-slate-500 dark:text-slate-400">Monitored Bucket:</span>
                  <span className="font-mono text-slate-900 dark:text-white font-semibold">s3-storage-lens-pavan-2026</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span className="text-slate-500 dark:text-slate-400">Primary Role:</span>
                  <span className="text-slate-200">Secondary Replica & Lens Rollup</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span className="text-slate-500 dark:text-slate-400">CRR Link:</span>
                  <span className="text-blue-300 font-mono font-bold">Synchronized</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-[#080C14] border border-white/[0.06] text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>Lat: 37.7749° N</span>
                <span>Long: 122.4194° W</span>
              </div>
            </div>
          </div>

          {/* Standby DR: ap-southeast-1 Singapore */}
          <div className="aws-card p-6 rounded-lg border-white/[0.1] bg-white dark:bg-[#0F1626]/90 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold flex items-center gap-1">
                <Radio className="w-3 h-3" />
                DR CANDIDATE
              </span>
            </div>

            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Radio className="w-5 h-5" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                  Asia Pacific (Singapore)
                </h3>
                <p className="text-xs font-mono text-purple-400 mt-0.5">
                  ap-southeast-1 • AWS Asia
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/[0.06] text-xs">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span className="text-slate-500 dark:text-slate-400">Failover Tier:</span>
                  <span className="font-mono text-slate-900 dark:text-white font-semibold">Tier 1 Standby Target</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span className="text-slate-500 dark:text-slate-400">Readiness Score:</span>
                  <span className="text-purple-300 font-mono font-bold">96% Compliant</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span className="text-slate-500 dark:text-slate-400">Evaluation:</span>
                  <span className="text-emerald-400 font-mono">Passing Criteria</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-[#080C14] border border-white/[0.06] text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>Lat: 1.3521° N</span>
                <span>Long: 103.8198° E</span>
              </div>
            </div>
          </div>
        </div>

        {/* Multi-Region Replication Connection Strip */}
        <div className="aws-card p-5 rounded-xl border-white/[0.08] bg-white dark:bg-[#0B0F19]/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white font-display">
                Cross-Region Durability & Failover Safety
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans mt-0.5">
                Objects replicated with AWS S3 Cross-Region Replication maintain multi-region availability
                and automated disaster recovery capability.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/regional-infrastructure')}
            className="btn-secondary !py-2 !px-3.5 text-xs whitespace-nowrap"
          >
            <span>View Full World Infrastructure Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
};
