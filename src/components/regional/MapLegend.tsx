import React from 'react';

interface MapLegendProps { className?: string; replicationPaths?: number }

export const MapLegend: React.FC<MapLegendProps> = ({ className = '', replicationPaths = 0 }) => (
  <div className={`px-3 py-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-300 dark:border-slate-700 rounded-md shadow-sm text-[11px] font-mono text-slate-700 dark:text-slate-300 ${className}`} aria-label="Map legend">
    <div className="flex items-center flex-wrap gap-x-4 gap-y-1.5">
      <div className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-400 ring-2 ring-blue-500/30"/><span>Observed bucket region</span></div>
      <div className="flex items-center gap-1.5"><span className={`inline-block h-0.5 w-4 rounded ${replicationPaths ? 'bg-emerald-400' : 'bg-slate-600'}`}/><span>{replicationPaths ? 'Enabled replication config' : 'No verified replication path'}</span></div>
    </div>
  </div>
);
