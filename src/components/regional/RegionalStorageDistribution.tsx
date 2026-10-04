import React from 'react';
import { HardDrive } from 'lucide-react';
import { RegionInfrastructure } from '../../types/regional';

interface RegionalStorageDistributionProps {
  regions: RegionInfrastructure[];
  onSelectRegion?: (region: RegionInfrastructure) => void;
  selectedRegionId?: string | null;
  className?: string;
}

export const RegionalStorageDistribution: React.FC<RegionalStorageDistributionProps> = ({
  regions,
  onSelectRegion,
  selectedRegionId,
  className = '',
}) => {
  const totalStorageTB = regions.reduce((acc, r) => acc + r.storageTB, 0);

  return (
    <div
      className={`aws-card p-5 ${className}`}
      aria-label="Regional Storage Distribution"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white font-display tracking-tight flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-amber-400 stroke-[2]" />
            Regional Storage Distribution
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Current object inventory grouped by bucket location; this is not replication evidence
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-700 dark:text-slate-300">
          <span className="text-slate-600 dark:text-slate-400">Observed storage total:</span>
          <span className="font-bold text-slate-900 dark:text-white text-sm bg-slate-100 dark:bg-white/[0.04] px-2 py-0.5 rounded border border-slate-200 dark:border-white/[0.08]">
            {totalStorageTB.toFixed(6)} TB
          </span>
        </div>
      </div>

      {/* Proportional Multi-Segment Horizontal Bar */}
      <div className="mb-5">
        <div className="h-3 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden flex p-0.5 border border-slate-200 dark:border-white/[0.08]">
          {regions.filter((region) => region.storageTB > 0).map((region, index) => (
            <div key={region.id} style={{ width: `${(region.storageTB / (totalStorageTB || 1)) * 100}%` }} className={`h-full transition-all ${index === 0 ? 'rounded-l-full' : ''} ${['bg-emerald-500', 'bg-blue-500', 'bg-violet-500', 'bg-amber-500'][index % 4]}`} title={`${region.awsRegion}: ${region.storageFormatted}`} />
          ))}
        </div>

        {/* Proportional Axis Legend */}
        <div className="flex justify-between items-center text-[10px] font-mono text-slate-600 dark:text-slate-500 mt-1 px-1">
          <span>0 TB</span>
          <span>{regions.length} observed regions</span>
          <span>{totalStorageTB.toFixed(6)} TB observed</span>
        </div>
      </div>

      {/* Horizontal Cards/Rows */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {regions.map((region) => {
          const isSelected = selectedRegionId === region.id;
          const isPrimary = region.role === 'Primary';
          const isCandidate = region.role === 'Failover Candidate';
          const percentage = totalStorageTB > 0 ? ((region.storageTB / totalStorageTB) * 100).toFixed(1) : '0';

          return (
            <div
              key={region.id}
              onClick={() => onSelectRegion?.(region)}
              className={`p-3.5 rounded-lg border transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'bg-amber-50 dark:bg-slate-900/90 border-amber-500/70 shadow-glowSm ring-1 ring-amber-500/30'
                  : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.07] hover:bg-white dark:hover:bg-white/[0.04] hover:border-slate-300 dark:hover:border-white/[0.14]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isPrimary
                        ? 'bg-emerald-400 ring-2 ring-emerald-500/30'
                        : isCandidate
                        ? 'border border-dashed border-amber-400 bg-amber-400/20'
                        : 'bg-blue-400 ring-2 ring-blue-500/30'
                    }`}
                  />
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white font-display">
                      {region.name}
                    </h3>
                    <p className="text-[10px] font-mono text-slate-400">
                      {region.awsRegion}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase ${
                    isPrimary
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25'
                      : isCandidate
                      ? 'bg-amber-500/10 text-amber-300 border-amber-500/25'
                    : 'bg-blue-50 dark:bg-blue-500/10 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-500/25'
                  }`}
                >
                  {region.role}
                </span>
              </div>

              {/* Metric Row */}
              <div className="mt-3 flex items-baseline justify-between pt-2 border-t border-white/[0.06]">
                <span className="text-[11px] text-slate-400">
                  {isCandidate ? 'Allocation State' : `${percentage}% of observed storage`}
                </span>
                <div className="text-right">
                  <span
                    className={`font-mono font-bold text-sm ${
                      isCandidate ? 'text-amber-500 dark:text-amber-400' : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {isCandidate ? 'Candidate' : region.storageFormatted}
                  </span>
                  {isCandidate && (
                    <span className="text-[10px] font-mono text-slate-500 block">
                      (0 TB synced)
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
