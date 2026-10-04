import React from 'react';
import { Sparkles, ArrowRight, Info, CheckCircle2 } from 'lucide-react';
import { OptimizationCandidate } from '../../types';
import { formatBytes } from '../../utils/formatters';

interface OptimizationInsightsCardProps {
  candidates?: OptimizationCandidate[];
  onFilterLowActivity?: () => void;
}

export const OptimizationInsightsCard: React.FC<OptimizationInsightsCardProps> = ({
  candidates = [],
  onFilterLowActivity,
}) => {
  const totalBytes = candidates.reduce((acc, c) => acc + (c.storageBytes || 0), 0);
  const totalFormatted = formatBytes(totalBytes);
  const totalSavings = candidates.reduce((acc, c) => acc + (c.estimatedMonthlyDifference || 0), 0);
  const savingsFormatted = totalSavings > 0.01 ? `$${totalSavings.toFixed(2)}/mo` : (totalSavings > 0 ? '< $0.01/mo' : 'Cost neutral hygiene');
  const candidatePrefixes = candidates.filter((c) => c.prefix !== '/*').slice(0, 2);

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 text-white border border-slate-700 shadow-md">
      {/* Subtle decorative glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-32 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Optimization Insights
            </span>
            <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Live AWS S3 Discovery
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-semibold text-slate-100 tracking-tight leading-snug">
            {candidates.length} storage optimization candidates discovered across {totalFormatted} of S3 objects.
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Review inventory-based storage and lifecycle candidates. Access activity is not inferred from key names.
            {candidatePrefixes.length > 0 ? (
              <>
                {' '}Example candidate prefixes include{' '}
                {candidatePrefixes.map((p, idx) => (
                  <span key={p.id}>
                    {idx > 0 && ' and '}
                    <code className="bg-slate-800/80 px-1.5 py-0.5 rounded font-mono text-amber-300">
                      {p.prefix}
                    </code>
                  </span>
                ))}
                {' '}with estimated storage cost delta of <strong className="text-emerald-400 font-semibold">{savingsFormatted}</strong> (ESTIMATED FROM S3 STORAGE VOLUME).
              </>
            ) : (
              ' Apply baseline lifecycle rules to expire incomplete multipart uploads and automate tiering.'
            )}
          </p>
        </div>

        <div className="shrink-0 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {onFilterLowActivity && (
            <button
              onClick={onFilterLowActivity}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-bold text-xs shadow-md transition-all"
            >
              <span>Filter High-Impact Candidates</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Provenance note */}
      <div className="relative z-10 mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          Heuristics derived from actual S3 object keys and bucket lifecycle status. Request metrics require CloudWatch request metrics.
        </span>
        <span className="font-mono text-slate-500 hidden sm:inline">
          ESTIMATED FROM S3 STORAGE VOLUME
        </span>
      </div>
    </div>
  );
};
