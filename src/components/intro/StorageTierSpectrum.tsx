import React from 'react';
import { HardDrive, DollarSign, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TierSpec {
  name: string;
  key: string;
  rate: string;
  rateValue: number;
  retrievalTime: string;
  minDuration: string;
  minObjectSize: string;
  durability: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  idealFor: string;
}

const AWS_TIERS: TierSpec[] = [
  {
    name: 'S3 Standard',
    key: 'STANDARD',
    rate: '$0.023 / GB / mo',
    rateValue: 0.023,
    retrievalTime: 'Milliseconds',
    minDuration: 'None',
    minObjectSize: 'None',
    durability: '99.999999999% (11 9s)',
    color: 'from-blue-500 to-indigo-600',
    badgeBg: 'bg-blue-500/15',
    badgeText: 'text-blue-300',
    borderColor: 'border-blue-500/30',
    idealFor: 'Frequently accessed data, high-throughput active uploads & immediate retrieval.',
  },
  {
    name: 'S3 Standard-IA',
    key: 'STANDARD_IA',
    rate: '$0.0125 / GB / mo',
    rateValue: 0.0125,
    retrievalTime: 'Milliseconds',
    minDuration: '30 days',
    minObjectSize: '128 KB minimum charge',
    durability: '99.999999999% (11 9s)',
    color: 'from-amber-400 to-amber-600',
    badgeBg: 'bg-amber-500/15',
    badgeText: 'text-amber-300',
    borderColor: 'border-amber-500/30',
    idealFor: 'Long-lived, infrequently accessed data requiring rapid millisecond retrieval when needed.',
  },
  {
    name: 'S3 Intelligent-Tiering',
    key: 'INTELLIGENT_TIERING',
    rate: 'Auto-Tiering ($0.023 - $0.004)',
    rateValue: 0.015,
    retrievalTime: 'Milliseconds',
    minDuration: '30 days',
    minObjectSize: '128 KB eligible',
    durability: '99.999999999% (11 9s)',
    color: 'from-purple-500 to-indigo-600',
    badgeBg: 'bg-purple-500/15',
    badgeText: 'text-purple-300',
    borderColor: 'border-purple-500/30',
    idealFor: 'Data with unknown, unpredictable, or changing access patterns with zero retrieval fees.',
  },
  {
    name: 'Glacier Flexible Retrieval',
    key: 'GLACIER',
    rate: '$0.004 / GB / mo',
    rateValue: 0.004,
    retrievalTime: 'Minutes to hours',
    minDuration: '90 days',
    minObjectSize: '40 KB',
    durability: '99.999999999% (11 9s)',
    color: 'from-cyan-400 to-teal-500',
    badgeBg: 'bg-cyan-500/15',
    badgeText: 'text-cyan-300',
    borderColor: 'border-cyan-500/30',
    idealFor: 'Archival data accessed 1–2 times per year (backup sets, regulatory historical data).',
  },
  {
    name: 'Glacier Deep Archive',
    key: 'DEEP_ARCHIVE',
    rate: '$0.00099 / GB / mo',
    rateValue: 0.00099,
    retrievalTime: '12 to 48 hours',
    minDuration: '180 days',
    minObjectSize: '40 KB',
    durability: '99.999999999% (11 9s)',
    color: 'from-slate-400 to-slate-600',
    badgeBg: 'bg-slate-500/15',
    badgeText: 'text-slate-600 dark:text-slate-300',
    borderColor: 'border-slate-500/30',
    idealFor: 'Long-term compliance preservation accessed rarely throughout a multi-year lifecycle.',
  },
];

export const StorageTierSpectrum: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 border-b border-white/[0.08] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono font-medium mb-3">
            <DollarSign className="w-3.5 h-3.5" />
            <span>AWS Storage Class Economics</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white font-display tracking-tight">
            Amazon S3 Storage Class Spectrum
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base mt-2 leading-relaxed">
            The optimization engine models transitions across official AWS storage tiers.
            Each tier maintains 99.999999999% (11 9s) durability with distinct pricing and retrieval characteristics.
          </p>
        </div>

        {/* Tier Cards Spectrum */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {AWS_TIERS.map((tier) => (
            <div
              key={tier.key}
              className="aws-card p-5 rounded-xl border-white/[0.08] flex flex-col justify-between hover:border-white/[0.2] transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${tier.badgeBg} ${tier.badgeText} ${tier.borderColor}`}
                  >
                    {tier.key}
                  </span>
                  <HardDrive className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
                    {tier.name}
                  </h3>
                  <div className="text-xs font-mono text-amber-300 font-bold mt-1">
                    {tier.rate}
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                  {tier.idealFor}
                </p>

                <div className="pt-2 border-t border-white/[0.06] space-y-1.5 text-[10px] font-mono">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span>Retrieval:</span>
                    <span className="text-slate-200">{tier.retrievalTime}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span>Min Retention:</span>
                    <span className="text-slate-200">{tier.minDuration}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span>Min Billable:</span>
                    <span className="text-slate-200">{tier.minObjectSize}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-white/[0.05] text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>11 9s Durability</span>
              </div>
            </div>
          ))}
        </div>

        {/* Transition Logic Callout */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#0F1626]/60 border border-white/[0.08] backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 font-mono font-bold text-xs">
              45%
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300 font-sans">
              <span className="font-semibold text-slate-900 dark:text-white">Direct Unit Economics: </span>
              Transitioning aged data from S3 Standard ($0.023/GB) to Standard-IA ($0.0125/GB) yields a 45.6%
              tier storage cost differential; transitioning to Glacier Flexible Retrieval ($0.004/GB) yields an 82.6% differential.
            </div>
          </div>

          <button
            onClick={() => navigate('/cost')}
            className="btn-secondary !py-2 !px-3.5 text-xs whitespace-nowrap"
          >
            <span>Inspect Cost Modeling</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
};
