import React from 'react';
import { SystemEvent } from '../../types';
import {
  RefreshCw,
  Sparkles,
  Clock,
  Database,
  DollarSign,
  CheckCircle2,
} from 'lucide-react';

interface RecentActivityListProps {
  events: SystemEvent[];
}

export const RecentActivityList: React.FC<RecentActivityListProps> = ({ events }) => {
  const getEventIcon = (type: SystemEvent['type']) => {
    switch (type) {
      case 'METRICS_REFRESH':
        return <RefreshCw className="w-3.5 h-3.5 text-blue-400" />;
      case 'OPTIMIZATION_FOUND':
        return <Sparkles className="w-3.5 h-3.5 text-amber-400" />;
      case 'LIFECYCLE_TRIGGER':
        return <Clock className="w-3.5 h-3.5 text-purple-400" />;
      case 'BUCKET_DISCOVERED':
        return <Database className="w-3.5 h-3.5 text-emerald-400" />;
      case 'COST_ANALYSIS':
        return <DollarSign className="w-3.5 h-3.5 text-indigo-400" />;
      default:
        return <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="divide-y divide-slate-100 dark:divide-white/[0.05] overflow-y-auto max-h-[380px] pr-1">
      {events.length === 0 && <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-900/50 dark:text-slate-400">No current inventory events returned by the backend.</p>}
      {events.map((evt) => (
        <div
          key={evt.id}
          className="py-3 px-1 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-white/[0.03] rounded-lg transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] flex items-center justify-center shrink-0 mt-0.5">
            {getEventIcon(evt.type)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-slate-900 dark:text-white truncate font-display">
                {evt.title}
              </p>
              <span className="text-[10px] font-mono text-slate-500 shrink-0">
                {evt.relativeTime}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
              {evt.description}
            </p>
            {evt.resourceId && (
              <span className="inline-block mt-1.5 font-mono text-[10px] bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-white/[0.08]">
                {evt.resourceId}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
