import React from 'react';
import { Globe, GitFork, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { RegionalSummaryData } from '../../types/regional';

interface RegionSummaryStripProps {
  summary: RegionalSummaryData;
  className?: string;
}

export const RegionSummaryStrip: React.FC<RegionSummaryStripProps> = ({
  summary,
  className = '',
}) => {
  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 select-none ${className}`}
      role="region"
      aria-label="Regional Infrastructure Summary Strip"
    >
      {/* Metrics Section: 3 items separated by subtle vertical borders */}
      <div className="flex items-center flex-wrap divide-x divide-slate-200 dark:divide-white/[0.08] gap-y-2">
        {/* Configured Regions */}
        <div className="flex items-center gap-3 pr-4 sm:pr-6">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <Globe className="w-4 h-4 text-emerald-400 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold font-mono text-slate-900 dark:text-white leading-none">
                {summary.configuredRegions}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap mt-0.5">
              AWS Regions Observed
            </p>
          </div>
        </div>

        {/* Replication Paths */}
        <div className="flex items-center gap-3 px-4 sm:px-6">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
            <GitFork className="w-4 h-4 text-blue-400 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold font-mono text-slate-900 dark:text-white leading-none">
                {summary.replicationPaths}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium whitespace-nowrap mt-0.5">
              Enabled Replication Rules
            </p>
          </div>
        </div>

        {/* Failover Candidate */}
        <div className="flex items-center gap-3 pl-4 sm:pl-6">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-amber-400 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold font-mono text-slate-900 dark:text-white leading-none">
                {summary.failoverCandidates}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium whitespace-nowrap mt-0.5">
              Failover Candidates
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: Global Status Banner */}
      <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-md bg-slate-100 border border-slate-300 dark:bg-slate-800 dark:border-slate-700 shrink-0 self-start sm:self-auto">
        <span className="relative flex h-2 w-2">
          <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-500"></span>
        </span>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 font-display">
            {summary.healthStatusText}
          </span>
        </div>
      </div>
    </div>
  );
};
