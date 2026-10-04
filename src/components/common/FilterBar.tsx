import React from 'react';
import { Search, RotateCcw, Filter } from 'lucide-react';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  selectedBucket?: string;
  onBucketChange?: (value: string) => void;
  bucketOptions?: FilterOption[];
  selectedClass?: string;
  onClassChange?: (value: string) => void;
  classOptions?: FilterOption[];
  selectedActivity?: string;
  onActivityChange?: (value: string) => void;
  activityOptions?: FilterOption[];
  onReset?: () => void;
  totalResultsCount?: number;
  filteredResultsCount?: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search by bucket, prefix, or resource...',
  selectedBucket,
  onBucketChange,
  bucketOptions,
  selectedClass,
  onClassChange,
  classOptions,
  selectedActivity,
  onActivityChange,
  activityOptions,
  onReset,
  totalResultsCount,
  filteredResultsCount,
}) => {
  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    (selectedBucket && selectedBucket !== 'ALL') ||
    (selectedClass && selectedClass !== 'ALL') ||
    (selectedActivity && selectedActivity !== 'ALL');

  return (
    <div className="bg-[#0F1626]/80 backdrop-blur-xl border border-white/[0.08] rounded-xl p-3.5 mb-5 shadow-lg shadow-black/20 space-y-3">
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-900/80 hover:bg-slate-900 focus:bg-slate-900 text-slate-100 border border-white/[0.08] hover:border-white/[0.14] focus:border-amber-500/60 rounded-lg outline-none focus:ring-1 focus:ring-amber-500/50 transition-colors placeholder:text-slate-500"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap">
          {bucketOptions && onBucketChange && (
            <select
              value={selectedBucket || 'ALL'}
              onChange={(e) => onBucketChange(e.target.value)}
              className="text-xs bg-slate-900/80 border border-white/[0.08] text-slate-200 py-2 px-3 rounded-lg outline-none focus:ring-1 focus:ring-amber-500 hover:border-white/[0.14]"
            >
              <option value="ALL" className="bg-slate-900 text-slate-200">All Buckets</option>
              {bucketOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-200">
                  {opt.label}
                </option>
              ))}
            </select>
          )}

          {classOptions && onClassChange && (
            <select
              value={selectedClass || 'ALL'}
              onChange={(e) => onClassChange(e.target.value)}
              className="text-xs bg-slate-900/80 border border-white/[0.08] text-slate-200 py-2 px-3 rounded-lg outline-none focus:ring-1 focus:ring-amber-500 hover:border-white/[0.14]"
            >
              <option value="ALL" className="bg-slate-900 text-slate-200">All Storage Classes</option>
              {classOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-200">
                  {opt.label}
                </option>
              ))}
            </select>
          )}

          {activityOptions && onActivityChange && (
            <select
              value={selectedActivity || 'ALL'}
              onChange={(e) => onActivityChange(e.target.value)}
              className="text-xs bg-slate-900/80 border border-white/[0.08] text-slate-200 py-2 px-3 rounded-lg outline-none focus:ring-1 focus:ring-amber-500 hover:border-white/[0.14]"
            >
              <option value="ALL" className="bg-slate-900 text-slate-200">All Activity Levels</option>
              {activityOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-200">
                  {opt.label}
                </option>
              ))}
            </select>
          )}

          {hasActiveFilters && onReset && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-white/[0.08] px-3 py-2 rounded-lg transition-colors"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Filter summary row */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-amber-400" />
          <span>
            Showing <strong className="text-white font-mono">{filteredResultsCount ?? totalResultsCount ?? 0}</strong>{' '}
            of <strong className="text-slate-300 font-mono">{totalResultsCount ?? 0}</strong> items
          </span>
          {hasActiveFilters && (
            <span className="text-[10px] text-amber-300 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded font-mono font-medium">
              Filtered
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
