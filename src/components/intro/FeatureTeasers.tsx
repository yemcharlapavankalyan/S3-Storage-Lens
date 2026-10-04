import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  BarChart3,
  Sparkles,
  RefreshCw,
  Calculator,
  Globe2,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface FeatureItem {
  id: string;
  featureNumber: string;
  title: string;
  quote: string;
  summary: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  bgGlow: string;
  path: string;
  buttonLabel: string;
  bullets: string[];
}

const FEATURES: FeatureItem[] = [
  {
    id: 'visibility',
    featureNumber: 'FEATURE 01',
    title: 'Storage Visibility',
    quote: 'Understand buckets, objects, storage classes, regions and encryption state from one place.',
    summary:
      'Gain centralized visibility into your entire Amazon S3 portfolio across AWS regions. Inspect bucket encryption configurations, versioning states, and prefix-level object hierarchies in an auditable inventory console.',
    icon: Eye,
    accentColor: 'text-blue-400',
    bgGlow: 'bg-blue-500/10 border-blue-500/20',
    path: '/buckets',
    buttonLabel: 'Explore Buckets Console',
    bullets: [
      'Multi-bucket inventory discovery and region classification',
      'Bucket security checks: SSE-S3 and SSE-KMS encryption states',
      'Prefix hierarchy inspection and object-level size aggregations',
    ],
  },
  {
    id: 'analytics',
    featureNumber: 'FEATURE 02',
    title: 'Storage Analytics',
    quote: 'Analyze storage distribution, bucket usage and prefix-level patterns.',
    summary:
      'Show published Storage Lens metrics separately from direct S3 inventory. Prefix activity classifications appear only when AWS supplies authoritative activity data.',
    icon: BarChart3,
    accentColor: 'text-amber-400',
    bgGlow: 'bg-amber-500/10 border-amber-500/20',
    path: '/analytics',
    buttonLabel: 'View Storage Analytics',
    bullets: [
      'AWS Storage Lens metric export status and published reports',
      'Prefix activity only when authoritative AWS data is available',
      'Historical trends appear only when AWS provides a reporting series',
    ],
  },
  {
    id: 'optimization',
    featureNumber: 'FEATURE 03',
    title: 'Optimization Engine',
    quote: 'Identify storage optimization candidates using observed S3 data and explicit rules.',
    summary:
      'Evaluate documented inventory evidence and modeled regional rates, with candidates reviewed before policy changes.',
    icon: Sparkles,
    accentColor: 'text-orange-400',
    bgGlow: 'bg-orange-500/10 border-orange-500/20',
    path: '/optimization',
    buttonLabel: 'Open Optimization Center',
    bullets: [
      'Candidate evidence derived from available object metadata and configured rules',
      'Estimated storage-class rate comparisons; region and retrieval requirements affect cost',
      'Approval state machine (REVIEW, APPROVED, REJECTED) with audit logging',
    ],
  },
  {
    id: 'lifecycle',
    featureNumber: 'FEATURE 04',
    title: 'Lifecycle Management',
    quote: 'Review and manage lifecycle transition and expiration strategies.',
    summary:
      'Review lifecycle configurations and transition plans. Changes to live bucket policies require an explicit operator action and successful AWS response.',
    icon: RefreshCw,
    accentColor: 'text-purple-400',
    bgGlow: 'bg-purple-500/10 border-purple-500/20',
    path: '/lifecycle',
    buttonLabel: 'Manage Lifecycle Policies',
    bullets: [
      'Configurable transitions and expiration schedules',
      'Noncurrent version expiration and incomplete multipart cleanup rules',
      'Review policy scope and validation results before any live change',
    ],
  },
  {
    id: 'cost',
    featureNumber: 'FEATURE 05',
    title: 'Cost Intelligence',
    quote: 'Estimate storage costs and compare storage strategies.',
    summary:
      'Model storage spending across AWS storage classes and compare alternative lifecycle strategies. View transparent price differentials without opaque estimation algorithms or synthetic benchmarks.',
    icon: Calculator,
    accentColor: 'text-emerald-400',
    bgGlow: 'bg-emerald-500/10 border-emerald-500/20',
    path: '/cost',
    buttonLabel: 'Compare Cost Strategies',
    bullets: [
      'Regional storage-class rate modeling',
      'Side-by-side strategy comparison: Aggressive vs Conservative tiering',
      'Modeled comparisons are estimates, not AWS billing data',
    ],
  },
  {
    id: 'infrastructure',
    featureNumber: 'FEATURE 06',
    title: 'Regional Infrastructure',
    quote: 'Visualize regional distribution, replication topology and failover readiness.',
    summary:
      'Map discovered bucket regions and inspect replication configuration when AWS returns it. Region placement alone does not establish replication or failover readiness.',
    icon: Globe2,
    accentColor: 'text-cyan-400',
    bgGlow: 'bg-cyan-500/10 border-cyan-500/20',
    path: '/regional-infrastructure',
    buttonLabel: 'Inspect Regional Topology',
    bullets: [
      'Interactive global topology visualizer with S3 bucket distribution',
      'Cross-Region Replication (CRR) link inspection and replication status',
      'Regional failover readiness assessment across primary and secondary regions',
    ],
  },
];

export const FeatureTeasers: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section id="capabilities" className="relative py-20 lg:py-28 bg-white dark:bg-[#06090F] border-b border-white/[0.07] overflow-hidden scroll-mt-20">
      {/* Background Subtle Gradient */}
      <div className="absolute top-1/3 right-1/4 w-[700px] h-[350px] bg-amber-500/[0.02] blur-3xl pointer-events-none rounded-full" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 font-mono text-[11px] font-semibold tracking-wider uppercase">
            System Capabilities
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight">
            Six Built-In Optimization Pillars
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-sans max-w-2xl mx-auto">
            Directly mapped to genuine AWS S3 capabilities and production infrastructure needs without synthetic claims.
          </p>
        </div>

        {/* 6 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feat) => {
            const Icon = feat.icon;

            return (
              <div
                key={feat.id}
                className="group p-6 sm:p-7 rounded-lg bg-white dark:bg-[#0B101D]/70 border border-white/[0.07] hover:border-white/[0.16] hover:bg-white dark:bg-[#0E1527] transition-all flex flex-col justify-between shadow-card hover:shadow-glowSm"
              >
                <div className="space-y-5">
                  {/* Top Badge & Icon */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">
                      {feat.featureNumber}
                    </span>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${feat.bgGlow} transition-transform group-hover:scale-105`}>
                      <Icon className={`w-4 h-4 ${feat.accentColor}`} />
                    </div>
                  </div>

                  {/* Title & Exact User Quote */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display group-hover:text-amber-300 transition-colors">
                      {feat.title}
                    </h3>
                    <div className="text-xs font-medium text-amber-300/90 font-sans italic border-l-2 border-amber-500/40 pl-2.5">
                      “{feat.quote}”
                    </div>
                  </div>

                  {/* Concise Summary */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                    {feat.summary}
                  </p>

                  {/* Verified Technical Bullets */}
                  <ul className="space-y-2 pt-2 border-t border-white/[0.05]">
                    {feat.bullets.map((bullet, idx) => (
                      <li key={idx} className="text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Footer Action Button */}
                <div className="pt-6 mt-6 border-t border-white/[0.06]">
                  <button
                    onClick={() => navigate(feat.path)}
                    className="w-full btn-secondary !py-2.5 !px-4 text-xs font-semibold flex items-center justify-between group-hover:border-amber-500/40 group-hover:bg-slate-800 transition-all"
                  >
                    <span>{feat.buttonLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default FeatureTeasers;
