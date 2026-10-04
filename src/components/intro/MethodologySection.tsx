import React, { useState } from 'react';
import {
  HardDrive,
  Activity,
  BarChart3,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  Check,
  Terminal,
} from 'lucide-react';

interface MethodologyStep {
  step: string;
  phase: string;
  name: string;
  tagline: string;
  summary: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  details: {
    objective: string;
    awsCapabilities: string[];
    technicalRule: string;
    metricMonitored: string;
  };
}

const METHODOLOGY_STEPS: MethodologyStep[] = [
  {
    step: '01',
    phase: 'STORE',
    name: 'Storage Ingestion & Organization',
    tagline: 'Multi-bucket inventory & prefix structure',
    summary:
      'Establishes durable object persistence across AWS S3 buckets with structured prefix partitions and encryption controls.',
    icon: HardDrive,
    color: 'from-blue-500 to-indigo-500',
    details: {
      objective: 'Ingest and organize raw objects across monitored AWS S3 buckets and regional locations.',
      awsCapabilities: [
        'Multi-bucket and regional inventory discovery through AWS APIs',
        'Hierarchical prefix partitioning (raw/, processed/, archives/)',
        'Server-Side Encryption validation (SSE-S3, SSE-KMS) and versioning verification',
      ],
      technicalRule: 'Objects must be partitioned by functional prefix to allow granular lifecycle transitions.',
      metricMonitored: 'Total Storage Bytes, Object Counts, Bucket Region Assignments',
    },
  },
  {
    step: '02',
    phase: 'MONITOR',
    name: 'Account-Level Observability',
    tagline: 'S3 Storage Lens & STS Identity Verification',
    summary:
      'Checks dashboard configuration and displays published Storage Lens metrics only when AWS makes them available.',
    icon: Activity,
    color: 'from-amber-400 to-amber-600',
    details: {
      objective: 'Continuously track account-level storage footprint, tier breakdown, and access configurations.',
      awsCapabilities: [
        'Storage Lens configuration and export status discovery',
        'AWS STS caller identity verification from the configured credential chain',
        'Storage Lens snapshots when published; direct S3 inventory is labeled separately',
      ],
      technicalRule: 'Storage Lens aggregation is performed by AWS; this application does not manufacture metrics.',
      metricMonitored: 'Published Storage Lens metrics and separately sourced S3 inventory',
    },
  },
  {
    step: '03',
    phase: 'ANALYZE',
    name: 'Inventory Analysis',
    tagline: 'Activity profiling & cold data detection',
    summary:
      'Summarizes prefix inventory and object age. Access activity classifications are shown only when authoritative AWS metrics are available.',
    icon: BarChart3,
    color: 'from-cyan-400 to-blue-500',
    details: {
      objective: 'Identify stagnant, cold storage segments accumulating in expensive Standard storage classes.',
      awsCapabilities: [
        'Prefix-level storage depth indexing and object count distribution',
        'Activity and request data are sourced only from published AWS observations',
        'Historical trends are displayed only after AWS returns a reporting series',
      ],
      technicalRule: 'Object age can be calculated from LastModified; it does not prove access frequency.',
      metricMonitored: 'Prefix inventory bytes, object counts, and LastModified age when available',
    },
  },
  {
    step: '04',
    phase: 'OPTIMIZE',
    name: 'Data-Driven Candidate Generation',
    tagline: 'Published rate differential calculation',
    summary:
      'Computes transparent cost differentials using published AWS rates and submits candidates to an engineering review ledger.',
    icon: Sparkles,
    color: 'from-amber-500 to-orange-500',
    details: {
      objective: 'Generate actionable, verified optimization candidates with deterministic cost differentials.',
      awsCapabilities: [
        'Regional AWS rate model; retrieval and minimum-duration charges may apply',
        'Confidence evaluation (High, Medium, Low) based on object sample depth',
        'Engineering review state machine with audit trails (REVIEW, APPROVED, REJECTED)',
      ],
      technicalRule: 'Candidate difference must be calculated from real storage volume, not arbitrary percentages.',
      metricMonitored: 'Cost Differential ($/mo), Candidate Priority, Approval State',
    },
  },
  {
    step: '05',
    phase: 'AUTOMATE',
    name: 'Declarative Lifecycle Deployment',
    tagline: 'Native S3 Lifecycle rule synthesis & execution',
    summary:
      'Synthesizes and applies valid S3 Lifecycle policies directly to AWS buckets via AWS SDK v3 for automated tier transitions.',
    icon: Zap,
    color: 'from-emerald-400 to-teal-500',
    details: {
      objective: 'Enforce continuous, automated storage class transitions without human manual intervention.',
      awsCapabilities: [
        '@aws-sdk/client-s3 PutBucketLifecycleConfigurationCommand dispatch',
        'Configurable lifecycle transitions reviewed before applying changes',
        'Noncurrent object version expiration and incomplete multipart upload cleanup',
      ],
      technicalRule: 'Dry-run policy validation ensures syntax and schema correctness prior to live dispatch.',
      metricMonitored: 'Active Bucket Policies, Transition Days, Noncurrent Expiration Rules',
    },
  },
];

export const MethodologySection: React.FC = () => {
  const [selectedStepIndex, setSelectedStepIndex] = useState<number>(0);
  const activeStep = METHODOLOGY_STEPS[selectedStepIndex];

  return (
    <section id="methodology" className="py-20 border-b border-white/[0.08] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono font-medium mb-3">
            <Activity className="w-3.5 h-3.5" />
            <span>Engineering Process</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white font-display tracking-tight">
            Methodology: Systematic Storage Optimization
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base mt-2 leading-relaxed">
            A structured, 5-stage lifecycle workflow ensuring telemetry rigor, auditability, and automated
            AWS policy execution.
          </p>
        </div>

        {/* Phase Stepper Flow Header */}
        <div className="p-2 rounded-lg bg-white dark:bg-[#0F1626]/60 border border-white/[0.08] backdrop-blur-xl">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {METHODOLOGY_STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isSelected = idx === selectedStepIndex;

              return (
                <button
                  key={step.phase}
                  onClick={() => setSelectedStepIndex(idx)}
                  className={`p-3.5 rounded-xl text-left transition-all relative flex flex-col justify-between ${
                    isSelected
                      ? 'bg-white dark:bg-[#131B2E] border border-amber-400/80 shadow-glowSm ring-1 ring-amber-400/30'
                      : 'bg-white/[0.02] border border-transparent hover:border-white/[0.1] hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span
                      className={`text-[10px] font-mono font-bold ${
                        isSelected ? 'text-amber-400' : 'text-slate-500'
                      }`}
                    >
                      PHASE {step.step}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                        isSelected
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-white/[0.04] text-slate-500'
                      }`}
                    >
                      {step.phase}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-bold'
                          : 'bg-white/[0.06] text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white font-display truncate">
                      {step.phase}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Phase Detail Showcase */}
        <div className="aws-card p-6 lg:p-8 rounded-lg bg-white dark:bg-[#0F1626]/90 border-white/[0.1]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Phase Summary */}
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-xs font-semibold">
                <span>Phase {activeStep.step}</span>
                <span>•</span>
                <span>{activeStep.phase}</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-display">
                {activeStep.name}
              </h3>

              <p className="text-xs font-mono text-amber-400/90 font-medium">
                {activeStep.tagline}
              </p>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                {activeStep.summary}
              </p>

              <div className="p-3.5 rounded-xl bg-white dark:bg-[#080C14] border border-white/[0.07] space-y-2">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-amber-400" />
                  <span>Telemetry Scope</span>
                </div>
                <div className="text-xs font-mono text-slate-200">
                  {activeStep.details.metricMonitored}
                </div>
              </div>
            </div>

            {/* Right Column: AWS Capabilities & Technical Execution Rule */}
            <div className="lg:col-span-7 space-y-6 lg:border-l lg:border-white/[0.08] lg:pl-8">
              {/* Objective */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
                  Phase Objective
                </div>
                <p className="text-xs sm:text-sm text-slate-200 bg-white/[0.02] p-3 rounded-xl border border-white/[0.06] leading-relaxed">
                  {activeStep.details.objective}
                </p>
              </div>

              {/* AWS Capabilities Checklist */}
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
                  AWS Capabilities Implemented
                </div>
                <div className="space-y-2.5">
                  {activeStep.details.awsCapabilities.map((cap, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.05]"
                    >
                      <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[2.5]" />
                      </div>
                      <span className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{cap}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Governance & Rule Constraint */}
              <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs">
                <div className="flex items-center gap-2 text-amber-300 font-mono font-bold mb-1">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Architecture Constraint</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-xs font-sans leading-relaxed">
                  {activeStep.details.technicalRule}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
