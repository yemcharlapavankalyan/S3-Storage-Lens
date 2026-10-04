import React, { ReactNode } from 'react';
import { RefreshCw, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  actions?: ReactNode;
  showDateRange?: boolean;
  showRefresh?: boolean;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actions,
  showDateRange = false,
  showRefresh = true,
}) => {
  const { dateRange, setDateRange, isRefreshing, triggerRefresh } = useApp();

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 mb-6 border-b border-slate-200 dark:border-white/[0.08]">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight flex items-center gap-3">
          {title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
          {subtitle}
        </p>
      </div>

      <div className="flex items-center flex-wrap gap-2.5 shrink-0">
        {showDateRange && (
          <div className="inline-flex items-center bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-white/[0.1] rounded-lg shadow-subtle text-xs font-medium text-slate-800 dark:text-slate-200">
            <span className="px-2.5 py-1.5 border-r border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              Range:
            </span>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 outline-none cursor-pointer focus:ring-1 focus:ring-amber-500 rounded-r-lg"
            >
              <option value="7d" className="bg-slate-900 text-slate-100">Last 7 Days</option>
              <option value="30d" className="bg-slate-900 text-slate-100">Last 30 Days</option>
              <option value="90d" className="bg-slate-900 text-slate-100">Last 90 Days</option>
              <option value="180d" className="bg-slate-900 text-slate-100">Last 6 Months</option>
              <option value="1y" className="bg-slate-900 text-slate-100">Last 12 Months</option>
            </select>
          </div>
        )}

        {showRefresh && (
          <button
            onClick={triggerRefresh}
            disabled={isRefreshing}
            className="btn-secondary !py-1.5 !px-3"
            title="Refresh live data from the configured backend"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : 'text-slate-400'}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync'}</span>
          </button>
        )}

        {actions}
      </div>
    </div>
  );
};
