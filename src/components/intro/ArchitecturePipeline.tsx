import React, { useState } from 'react';
import {
  Database,
  Layers,
  BarChart3,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  TrendingDown,
  ArrowDown,
  ChevronRight,
  Terminal,
  ShieldCheck,
} from 'lucide-react';

interface ArchStage {
  id: string;
  number: string;
  name: string;
  subhead: string;
  role: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  borderColor: string;
  bgGradient: string;
  badge: string;
  awsService: string;
  inputs: string[];
  operation: string;
  outputs: string[];
}

const ARCH_STAGES: ArchStage[] = [
  {
    id: 's3',
    number: '01',
    name: 'Amazon S3',
    subhead: 'Raw Object Inventory',
    role: 'Multi-bucket raw object storage, prefix partitioning, and security encryption audits.',
    icon: Database,
    accentColor: 'text-blue-400',
    borderColor: 'border-blue-500/40',
    bgGradient: 'from-blue-500/10 to-indigo-500/5',
    badge: 'AWS S3 Core',
    awsService: '@aws-sdk/client-s3 : ListBuckets, ListObjectsV2',
    inputs: ['Object keys & sizes', 'LastModified timestamps', 'SSE-S3/KMS encryption flags'],
    operation: 'Catalog multi-bucket inventory across regions and parse prefix hierarchies (raw/, processed/, archives/).',
    outputs: ['Normalized bucket catalog', 'Prefix trees ready for telemetry analysis'],
  },
  {
    id: 'lens',
    number: '02',
    name: 'S3 Storage Lens',
    subhead: 'AWS-published metrics',
    role: 'Displays AWS Storage Lens configuration and published metrics when available.',
    icon: Layers,
    accentColor: 'text-amber-400',
    borderColor: 'border-amber-500/40',
    bgGradient: 'from-amber-500/10 to-orange-500/5',
    badge: 'S3 Control',
    awsService: '@aws-sdk/client-s3-control : GetStorageLensConfiguration',
    inputs: ['Storage Lens configuration', 'AWS account identity', 'Published metric exports when available'],
    operation: 'Reads Storage Lens configuration and displays AWS-published metrics separately from direct S3 inventory.',
    outputs: ['Configuration status', 'Published metrics when available'],
  },
  {
    id: 'analysis',
    number: '03',
    name: 'Analysis Engine',
    subhead: 'Prefix Telemetry Profiling',
    role: 'Summarizes object age, storage class, and prefix inventory. Access frequency is shown only when authoritative metrics are available.',
    icon: BarChart3,
    accentColor: 'text-cyan-400',
    borderColor: 'border-cyan-500/40',
    bgGradient: 'from-cyan-500/10 to-blue-500/5',
    badge: 'Telemetry Engine',
    awsService: 'Prefix Profiling API (/api/analytics/prefixes)',
    inputs: ['Object timestamps', 'Prefix size totals', 'AWS activity metrics when available'],
    operation: 'Separates observed inventory from unavailable activity data; candidate rules use only documented inputs.',
    outputs: ['Prefix inventory summaries', 'Review candidates with evidence'],
  },
  {
    id: 'optimization',
    number: '04',
    name: 'Optimization Engine',
    subhead: 'Deterministic Transition Rules',
    role: 'Applies explicit rule-based algorithms to evaluate storage-class transitions and tier differentials.',
    icon: Sparkles,
    accentColor: 'text-orange-400',
    borderColor: 'border-orange-500/40',
    bgGradient: 'from-orange-500/10 to-amber-500/5',
    badge: 'Decision Engine',
    awsService: 'Differential Economics Engine (/api/optimization/candidates)',
    inputs: ['Available prefix inventory', 'Regional AWS storage-class rate estimates'],
    operation: 'Evaluates documented inventory evidence, policy settings, and modeled storage rates.',
    outputs: ['Reviewable transition candidates', 'Estimated monthly cost difference'],
  },
  {
    id: 'recommendations',
    number: '05',
    name: 'Recommendations',
    subhead: 'Auditable Approval Ledger',
    role: 'Maintains candidate approval workflow with operator validation prior to bucket changes.',
    icon: CheckCircle2,
    accentColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/40',
    bgGradient: 'from-emerald-500/10 to-teal-500/5',
    badge: 'Governance',
    awsService: 'Approval State Ledger (/api/optimization/candidates/:id)',
    inputs: ['Optimization candidates', 'Operator approval or rejection decisions'],
    operation: 'Tracks transition rationale, projected differential, and explicit human sign-off in an immutable audit ledger.',
    outputs: ['Approved policy batch ready for dispatch', 'Audit compliance records'],
  },
  {
    id: 'lifecycle',
    number: '06',
    name: 'Lifecycle Automation',
    subhead: 'Lifecycle policy review',
    role: 'Reviews lifecycle configuration; live changes require an explicit operator action.',
    icon: RefreshCw,
    accentColor: 'text-purple-400',
    borderColor: 'border-purple-500/40',
    bgGradient: 'from-purple-500/10 to-indigo-500/5',
    badge: 'Policy Engine',
    awsService: '@aws-sdk/client-s3 : PutBucketLifecycleConfiguration',
    inputs: ['Approved candidates', 'Existing bucket lifecycle rules', 'Dry-run verification'],
    operation: 'Shows configured lifecycle rules and policy actions returned by AWS.',
    outputs: ['Reviewed lifecycle configuration', 'AWS-confirmed result after an operator action'],
  },
  {
    id: 'efficiency',
    number: '07',
    name: 'Storage Efficiency',
    subhead: 'Measurable Cost & Tier Health',
    role: 'Compares observed inventory with modeled rates; it does not verify billing savings.',
    icon: TrendingDown,
    accentColor: 'text-amber-400',
    borderColor: 'border-amber-500/40',
    bgGradient: 'from-amber-500/10 to-emerald-500/5',
    badge: 'Outcome',
    awsService: 'Storage Lens Verification & Cost Comparison (/api/cost)',
    inputs: ['Available S3 inventory', 'Regional storage-class rate estimates'],
    operation: 'Presents estimated cost comparisons; actual billing and transitions must be verified in AWS.',
    outputs: ['Estimated cost comparison', 'Observed storage class distribution'],
  },
];

export const ArchitecturePipeline: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string>('optimization');

  const selectedStage =
    ARCH_STAGES.find((s) => s.id === selectedId) || ARCH_STAGES[3];

  return (
    <section id="architecture" className="relative py-20 lg:py-28 bg-white dark:bg-[#080C14] border-b border-white/[0.07] overflow-hidden scroll-mt-20">
      {/* Background Subtle Technical Grid */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 cloud-grid opacity-20" />
        <div className="absolute bottom-10 left-1/3 w-[600px] h-[350px] bg-amber-500/[0.02] blur-3xl rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        
        {/* Section Header with Exact User Heading */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 font-mono text-[11px] font-semibold tracking-wider uppercase">
            End-To-End Architecture
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight">
            From storage data to storage decisions.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-sans max-w-2xl mx-auto">
            A 7-stage architectural progression illustrating how raw S3 object telemetry transforms into automated, verifiable storage efficiency.
          </p>
        </div>

        {/* 7-Stage Architectural Chain Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Interactive 7-Stage Vertical Schematic */}
          <div className="lg:col-span-7 space-y-2 relative">
            {ARCH_STAGES.map((stage, idx) => {
              const Icon = stage.icon;
              const isSelected = stage.id === selectedId;

              return (
                <div key={stage.id} className="relative">
                  <button
                    onClick={() => setSelectedId(stage.id)}
                    className={`w-full text-left p-3.5 sm:p-4 rounded-xl transition-all border flex items-center justify-between group cursor-pointer ${
                      isSelected
                        ? `bg-slate-900/90 border-white/[0.2] ${stage.borderColor} shadow-lg ring-1 ring-white/10`
                        : 'bg-slate-900/40 border-white/[0.05] hover:bg-slate-900/70 hover:border-white/[0.1]'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-white/[0.08] bg-slate-950/80`}>
                        <Icon className={`w-4 h-4 ${stage.accentColor}`} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-slate-500">
                            {stage.number}
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-display truncate group-hover:text-amber-300 transition-colors">
                            {stage.name}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/[0.05] text-slate-500 dark:text-slate-400 border border-white/[0.06] hidden sm:inline">
                            {stage.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {stage.subhead}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className={`text-[10px] font-mono hidden sm:inline ${isSelected ? 'text-amber-400' : 'text-slate-500'}`}>
                        {isSelected ? 'Inspecting' : 'Details'}
                      </span>
                      <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'rotate-90 text-amber-400' : 'text-slate-600'}`} />
                    </div>
                  </button>

                  {/* Flow Connector Arrow between stages */}
                  {idx < ARCH_STAGES.length - 1 && (
                    <div className="flex justify-center my-0.5">
                      <ArrowDown className="w-3 h-3 text-slate-600/70" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right: Technical Stage Inspector HUD */}
          <div className="lg:col-span-5 sticky top-24">
            <div className="p-6 rounded-lg bg-gradient-to-b from-[#0F1626] to-[#0A0E1A] border border-white/[0.09] shadow-2xl backdrop-blur-xl space-y-6">
              
              {/* Header */}
              <div className="pb-4 border-b border-white/[0.08] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center border border-white/[0.1] bg-slate-900`}>
                    <selectedStage.icon className={`w-4 h-4 ${selectedStage.accentColor}`} />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Stage {selectedStage.number} Specification
                    </div>
                    <div className="text-base font-bold text-slate-900 dark:text-white font-display">
                      {selectedStage.name}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  {selectedStage.badge}
                </span>
              </div>

              {/* Role Description */}
              <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                {selectedStage.role}
              </div>

              {/* AWS Service / SDK Execution */}
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/70 border border-white/[0.05]">
                <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Terminal className="w-3 h-3 text-amber-400" />
                  <span>AWS Engine Operation</span>
                </div>
                <div className="text-[11px] font-mono text-amber-300 break-all">
                  {selectedStage.awsService}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-sans pt-1">
                  {selectedStage.operation}
                </div>
              </div>

              {/* Ingested Inputs & Generated Outputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/50 border border-white/[0.05] space-y-1.5">
                  <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Inputs
                  </div>
                  <ul className="space-y-1 text-[11px] font-mono text-slate-600 dark:text-slate-300">
                    {selectedStage.inputs.map((inp, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <span className="text-slate-600">•</span>
                        <span>{inp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/50 border border-white/[0.05] space-y-1.5">
                  <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>Outputs</span>
                  </div>
                  <ul className="space-y-1 text-[11px] font-mono text-emerald-300/90">
                    {selectedStage.outputs.map((out, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <span>•</span>
                        <span>{out}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Footer Note */}
              <div className="pt-2 border-t border-white/[0.06] text-[11px] font-mono text-slate-500 flex items-center justify-between">
                <span>Deterministic Verification</span>
                <span className="text-amber-400/80">AWS Architecture Flow</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default ArchitecturePipeline;
