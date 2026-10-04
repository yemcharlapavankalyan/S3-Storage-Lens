import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { StorageByClassItem } from '../../types';

interface StorageClassDonutProps {
  data: StorageByClassItem[];
}

export const StorageClassDonut: React.FC<StorageClassDonutProps> = ({ data }) => {
  if (!data.length) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-md border border-slate-200 bg-slate-50 p-6 text-center dark:border-slate-700 dark:bg-slate-900/40">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Storage class breakdown unavailable</p>
        <p className="mt-1 max-w-sm text-xs text-slate-600 dark:text-slate-400">No current S3 inventory by storage class was returned. No zero values are substituted.</p>
      </div>
    );
  }
  const totalBytes = data.reduce(
    (sum, item) =>
      sum +
      (item.bytes ||
        (item.gb
          ? item.gb * 1024 * 1024 * 1024
          : (item.tb || 0) * 1024 * 1024 * 1024 * 1024)),
    0
  );

  let formattedTotal = '0 B';
  if (totalBytes >= 1024 * 1024 * 1024 * 1024 * 0.1) {
    formattedTotal = `${(totalBytes / (1024 * 1024 * 1024 * 1024)).toFixed(2)} TB`;
  } else if (totalBytes >= 1024 * 1024 * 1024) {
    formattedTotal = `${(totalBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  } else if (totalBytes >= 1024 * 1024) {
    formattedTotal = `${(totalBytes / (1024 * 1024)).toFixed(2)} MB`;
  } else if (totalBytes > 0) {
    formattedTotal = `${(totalBytes / 1024).toFixed(1)} KB`;
  }

  const customTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload as StorageByClassItem;
      const displayStorage =
        item.formattedStorage ||
        (item.tb > 0 ? `${item.tb} TB` : `${item.gb || 0} GB`);

      return (
        <div className="bg-white dark:bg-[#0B0F19]/95 backdrop-blur-xl text-slate-900 dark:text-white text-xs p-3 rounded-xl shadow-2xl border border-slate-200 dark:border-white/[0.1] font-sans">
          <p className="font-bold text-slate-900 dark:text-white font-display">{item.name}</p>
          <div className="mt-1.5 space-y-1 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
            <p>
              Storage:{' '}
              <span className="font-bold text-amber-400">
                {displayStorage}
              </span>{' '}
              ({item.percentage}%)
            </p>
            <p className="text-slate-400">
              Est. Cost: ~${(item.monthlyCostEstimated || 0).toFixed(2)}/mo
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Donut chart */}
      <div className="w-full md:w-3/5 h-64 relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={68}
              outerRadius={96}
              paddingAngle={4}
              dataKey="percentage"
              stroke="#080C14"
              strokeWidth={3}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={customTooltip} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-2">
          <span className="text-2xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight">
            {formattedTotal}
          </span>
          <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-widest font-mono">
            Discovered
          </span>
        </div>
      </div>

      {/* Breakdown Legend list */}
      <div className="w-full md:w-2/5 space-y-2 pr-1">
        {data.map((item) => {
          const displayStorage =
            item.formattedStorage ||
            (item.tb > 0 ? `${item.tb} TB` : `${item.gb || 0} GB`);

          return (
            <div
              key={item.key}
              className="flex items-center justify-between text-xs p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors border border-transparent hover:border-slate-200 dark:hover:border-white/[0.06]"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
                  {item.name}
                </span>
              </div>
              <div className="text-right shrink-0 font-mono">
                <span className="font-semibold text-slate-900 dark:text-white">
                  {displayStorage}
                </span>
                <span className="text-slate-400 text-[11px] ml-1.5">
                  ({item.percentage}%)
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
