import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  description: string;
  icon: LucideIcon;
  subtext?: string;
  badgeLabel?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType = 'positive',
  description,
  icon: Icon,
  subtext,
  badgeLabel,
}) => {
  const isPositive = changeType === 'positive';
  const isNegative = changeType === 'negative';
  const provenanceLabel = badgeLabel === 'CALCULATED_FROM_S3' ? 'CALCULATED' : badgeLabel;

  return (
    <div className="aws-card p-4 sm:p-5 group hover:border-sky-500/40 transition-colors duration-150">

      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1 pr-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 font-sans">
              {title}
            </span>
            {badgeLabel && (
              <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded border font-mono ${
                provenanceLabel === 'LIVE AWS' ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30' :
                provenanceLabel === 'STORAGE LENS' ? 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/30' :
                provenanceLabel === 'CALCULATED' ? 'bg-cyan-50 text-cyan-800 border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-300 dark:border-cyan-500/30' :
                provenanceLabel === 'UNAVAILABLE' ? 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600' :
                'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30'
              }`}>
                {provenanceLabel}
              </span>
            )}
          </div>

          <div className="mt-2.5 flex items-baseline gap-2.5">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display">
              {value}
            </span>
            {change && (
              <span
                className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full border ${
                  isPositive
                    ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/25'
                    : isNegative
                    ? 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-300 dark:border-rose-500/25'
                    : 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-500/10 border-slate-300 dark:border-slate-500/20'
                }`}
              >
                {isPositive && <TrendingUp className="w-3 h-3 mr-1 inline" />}
                {isNegative && <TrendingDown className="w-3 h-3 mr-1 inline" />}
                {change}
              </span>
            )}
          </div>

          <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 line-clamp-1 leading-relaxed">
            {description}
          </p>

          {subtext && (
            <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-white/[0.06] flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 font-mono">
              <span>{subtext}</span>
            </div>
          )}
        </div>

        <div className="w-9 h-9 rounded-md bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:text-sky-700 dark:group-hover:text-sky-300 transition-colors shrink-0">
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
