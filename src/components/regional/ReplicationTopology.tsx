import React from 'react';
import { GitFork, CircleHelp } from 'lucide-react';
import { RegionInfrastructure } from '../../types/regional';

interface ReplicationTopologyProps {
  regions: RegionInfrastructure[];
  selectedRegionId?: string | null;
  onSelectRegion?: (region: RegionInfrastructure) => void;
  className?: string;
}

export const ReplicationTopology: React.FC<ReplicationTopologyProps> = ({ regions, selectedRegionId, onSelectRegion, className = '' }) => {
  const configuredRules = regions.flatMap((region) => region.replicationTargets.map((target) => ({ source: region, target })));
  return <section className={`aws-card p-5 ${className}`} aria-label="Verified S3 replication configuration">
    <div className="flex items-start justify-between gap-3">
      <div>
        <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white"><GitFork className="h-4 w-4 text-blue-500"/>Replication configuration</h2>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Replication rules verified through S3 GetBucketReplication calls.</p>
      </div>
      <span className="rounded border border-slate-300 bg-slate-100 px-2 py-0.5 text-[10px] font-mono text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">{configuredRules.length} enabled rules</span>
    </div>
    <div className="mt-4 space-y-2">
      {configuredRules.map(({ source, target }, index) => <button key={`${source.id}-${target.targetRegionId}-${index}`} onClick={() => onSelectRegion?.(source)} className={`flex w-full flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-left text-xs transition-colors ${selectedRegionId === source.id ? 'border-amber-400 bg-amber-50 dark:bg-amber-500/10' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-white/10 dark:bg-slate-900/40 dark:hover:bg-white/5'}`}>
        <span className="font-semibold text-slate-900 dark:text-slate-100">{source.awsRegion} → {target.awsRegion}</span>
        <span className="text-slate-600 dark:text-slate-300">Rule enabled · replication lag and completion status unavailable</span>
      </button>)}
      {configuredRules.length === 0 && <div className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-900/40"><CircleHelp className="mt-0.5 h-4 w-4 shrink-0 text-slate-500"/><p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">{regions.some((region) => region.replicationVerification === 'UNAVAILABLE') ? 'Replication configuration could not be verified for all discovered buckets with current AWS permissions. No path is drawn unless AWS returns an enabled rule.' : regions.length === 0 ? 'No live region inventory is available.' : 'AWS returned no enabled S3 replication rules for discovered buckets. This does not assess recovery readiness or replication performance.'}</p></div>}
    </div>
  </section>;
};
