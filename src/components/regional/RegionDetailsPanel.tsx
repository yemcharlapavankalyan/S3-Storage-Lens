import React from 'react';
import { RegionInfrastructure } from '../../types/regional';
import {
  Globe,
  Database,
  Files,
  HardDrive,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface RegionDetailsPanelProps {
  selectedRegion: RegionInfrastructure | null;
  onClearSelection?: () => void;
  className?: string;
}

export const RegionDetailsPanel: React.FC<RegionDetailsPanelProps> = ({
  selectedRegion,
  onClearSelection,
  className = '',
}) => {
  const { addToast } = useApp();

  if (!selectedRegion) {
    return (
      <div
        className={`aws-card p-6 flex flex-col items-center justify-center text-center h-full min-h-[380px] select-none ${className}`}
      >
        <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-slate-500 mb-3">
          <Globe className="w-6 h-6 text-slate-400 stroke-[1.5]" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200 font-display">
          No Region Selected
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 max-w-[220px] leading-relaxed">
          Select a region on the map to inspect infrastructure.
        </p>
      </div>
    );
  }

  const isPrimary = selectedRegion.role === 'Primary';
  const isCandidate = selectedRegion.role === 'Failover Candidate';
  const isHealthy = selectedRegion.status === 'Healthy' || selectedRegion.status === 'Ready';

  const handleViewDetails = () => {
    addToast(
      `${selectedRegion.name} (${selectedRegion.awsRegion})`,
      'Inspecting regional S3 storage lens configuration and bucket replication topologies.',
      'info'
    );
  };

  return (
    <div
      className={`aws-card p-5 flex flex-col justify-between h-full min-h-[460px] text-slate-800 dark:text-slate-100 transition-all ${className}`}
      aria-label={`Region Details for ${selectedRegion.name}`}
    >
      <div className="space-y-4">
        {/* Header: Region Name & AWS Region Code */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-display tracking-tight">
                {selectedRegion.name}
              </h2>
              {onClearSelection && (
                <button
                  type="button"
                  onClick={onClearSelection}
                  title="Deselect region"
                  className="p-1 rounded text-slate-500 hover:text-white hover:bg-white/[0.08] transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <p className="text-xs font-mono text-slate-400 mt-0.5 tracking-wide flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              {selectedRegion.awsRegion}
            </p>
          </div>

          {/* Quick Region Type Badge */}
          <span
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
              isPrimary
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : isCandidate
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
            }`}
          >
            {selectedRegion.role}
          </span>
        </div>

        {/* Role & Status Row */}
        <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.06]">
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-500 font-semibold block">
              ROLE
            </span>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block truncate">
              {selectedRegion.role}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-500 font-semibold block">
              STATUS
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold mt-0.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isHealthy ? 'bg-emerald-400 ring-2 ring-emerald-500/20' : selectedRegion.status === 'Observed' ? 'bg-blue-500 ring-2 ring-blue-500/20' : 'bg-amber-400 ring-2 ring-amber-500/20'
                }`}
              />
              <span className={isHealthy ? 'text-emerald-700 dark:text-emerald-300' : selectedRegion.status === 'Observed' ? 'text-blue-700 dark:text-blue-300' : 'text-amber-700 dark:text-amber-300'}>
                {selectedRegion.status}
              </span>
            </span>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-slate-200 dark:border-white/[0.08]" />

        {/* Metrics Grid: Storage, Objects, Buckets */}
        <div>
          <span className="text-[10px] uppercase font-mono text-slate-500 font-bold tracking-wider mb-2 block">
            Storage & Inventory
          </span>
          <div className="grid grid-cols-3 gap-2">
            {/* Storage */}
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
              <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-1">
                <HardDrive className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="truncate">Storage</span>
              </div>
              <span className="text-sm font-bold font-mono text-slate-900 dark:text-white block">
                {selectedRegion.storageFormatted}
              </span>
            </div>

            {/* Objects */}
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
              <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-1">
                <Files className="w-3 h-3 text-blue-400 shrink-0" />
                <span className="truncate">Objects</span>
              </div>
              <span className="text-sm font-bold font-mono text-slate-900 dark:text-white block">
                {selectedRegion.objectsFormatted}
              </span>
            </div>

            {/* Buckets */}
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
              <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-1">
                <Database className="w-3 h-3 text-purple-400 shrink-0" />
                <span className="truncate">Buckets</span>
              </div>
              <span className="text-sm font-bold font-mono text-slate-900 dark:text-white block">
                {selectedRegion.bucketsCount}
              </span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-white/[0.08]" />

        {/* Replication Target Breakdown */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-mono text-slate-500 font-bold tracking-wider">
              Replication
            </span>
            <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400">
              {selectedRegion.replicationTargets.length} verified rules
            </span>
          </div>

          <div className="space-y-1.5">
            {selectedRegion.replicationTargets.map((target) => (
              <div
                key={target.targetRegionId}
                className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.05] text-xs hover:bg-white/[0.04] transition-colors"
              >
                <div className="min-w-0 pr-2">
                  <p className="font-semibold text-slate-200 truncate text-[11px]">
                    {target.targetRegionName}
                  </p>
                  <p className="text-[10px] font-mono text-slate-500">
                    {target.awsRegion} • {target.type}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
                      target.status === 'Synchronized'
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
                        : 'bg-amber-500/15 text-amber-300 border border-amber-500/25'
                    }`}
                  >
                    {target.status === 'Synchronized' && (
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                    )}
                    {target.status === 'Candidate' && (
                      <Clock className="w-2.5 h-2.5 text-amber-400" />
                    )}
                    {target.status}
                  </span>
                </div>
              </div>
            ))}
            {selectedRegion.replicationTargets.length === 0 && <p className="rounded-md bg-slate-50 p-2 text-[11px] text-slate-600 dark:bg-slate-900/50 dark:text-slate-400">{selectedRegion.replicationVerification === 'UNAVAILABLE' ? 'Replication configuration could not be verified with current AWS permissions.' : selectedRegion.replicationVerification === 'VERIFIED' ? 'No enabled replication configuration was found.' : 'Replication configuration has not been checked.'}</p>}
          </div>
        </div>

        {/* Divider */}
        <hr className="border-slate-200 dark:border-white/[0.08]" />

        {/* Failover Readiness Section */}
        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-white/[0.08]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-800 dark:text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              Failover Readiness
            </span>
            <span
              className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                selectedRegion.failoverReadiness === 'READY' || selectedRegion.failoverReadiness === 'ACTIVE'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40'
              }`}
            >
              {selectedRegion.failoverReadiness === 'UNVERIFIED' ? 'NOT VERIFIED' : selectedRegion.failoverReadiness}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed font-sans">
            {selectedRegion.failoverReadiness === 'ACTIVE' &&
              'Primary read/write region for storage lens metrics & data tiering.'}
            {selectedRegion.failoverReadiness === 'READY' &&
              'Cross-region replica standby with zero replication backlog.'}
            {selectedRegion.failoverReadiness === 'EVALUATION' &&
              'Under evaluation for high-durability disaster recovery routing.'}
            {selectedRegion.failoverReadiness === 'UNVERIFIED' &&
              'Failover readiness is not verified by current AWS configuration or test evidence.'}
          </p>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 mt-4 border-t border-slate-200 dark:border-white/[0.08]">
        <button
          type="button"
          onClick={handleViewDetails}
          className="w-full btn-secondary !py-2.5 justify-center font-semibold text-xs"
        >
          <span>View Region Details</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>
    </div>
  );
};
