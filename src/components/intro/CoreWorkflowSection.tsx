import React, { useState } from 'react';
import {
  HardDrive,
  Activity,
  BarChart3,
  Sparkles,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Terminal,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WorkflowStage {
  id: string;
  stageNumber: string;
  label: string;
  awsComponent: string;
  summary: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  borderActive: string;
  badgeBg: string;
  path: string;
  inputs: string[];
  awsOperation: string;
  outputs: string[];
}

const WORKFLOW_STAGES: WorkflowStage[] = [
  {
    id: 'store',
    stageNumber: '01',
    label: 'STORE',
    awsComponent: 'Amazon S3',
    summary: 'Multi-bucket raw object storage, hierarchical prefix partitioning, and security configuration.',
    icon: HardDrive,
    accentColor: 'text-blue-400',
    borderActive: 'border-blue-500 shadow-blue-500/20',
    badgeBg: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
    path: '/buckets',
    inputs: ['Object keys', 'LastModified timestamps', 'Bucket SSE encryption'],
    awsOperation: '@aws-sdk/client-s3 : ListBuckets, ListObjectsV2',
    outputs: ['Discovered bucket catalog', 'Prefix trees (raw/, logs/, archives/)'],
  },
  {
    id: 'monitor',
    stageNumber: '02',
    label: 'MONITOR',
    awsComponent: 'S3 Storage Lens',
    summary: 'Account-level configuration and published daily metrics, when available from AWS.',
    icon: Activity,
    accentColor: 'text-amber-400',
    borderActive: 'border-amber-500 shadow-amber-500/20',
    badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    path: '/dashboard',
    inputs: ['Storage Lens configuration status', 'STS caller identity'],
    awsOperation: '@aws-sdk/client-s3-control : GetStorageLensConfiguration',
    outputs: ['Dashboard configuration status', 'Published metrics when available'],
  },
  {
    id: 'analyze',
    stageNumber: '03',
    label: 'ANALYZE',
    awsComponent: 'Storage Analytics',
    summary: 'Analyze inventory by bucket, region, storage class, and prefix; activity remains unavailable until AWS reports it.',
    icon: BarChart3,
    accentColor: 'text-cyan-400',
    borderActive: 'border-cyan-500 shadow-cyan-500/20',
    badgeBg: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
    path: '/analytics',
    inputs: ['S3 object inventory', 'Prefix-level byte aggregations'],
    awsOperation: 'S3 Optimizer Prefix Telemetry Engine (/api/analytics)',
    outputs: ['Observed inventory summaries', 'Storage Lens activity metrics when published'],
  },
  {
    id: 'optimize',
    stageNumber: '04',
    label: 'OPTIMIZE',
    awsComponent: 'Optimization Engine',
    summary: 'Rule-based candidate evaluation using published AWS tier pricing and auditable review approval state.',
    icon: Sparkles,
    accentColor: 'text-orange-400',
    borderActive: 'border-orange-500 shadow-orange-500/20',
    badgeBg: 'bg-orange-500/10 text-orange-300 border-orange-500/20',
    path: '/optimization',
    inputs: ['Object inventory and timestamps', 'AWS tier rate estimates for the selected region'],
    awsOperation: 'Deterministic Transition Rules (/api/optimization/candidates)',
    outputs: ['Auditable candidate ledger', 'Approval state machine (REVIEW/APPROVED)'],
  },
  {
    id: 'automate',
    stageNumber: '05',
    label: 'AUTOMATE',
    awsComponent: 'Lifecycle Management',
    summary: 'Review lifecycle configurations; live policy changes require an operator action.',
    icon: RefreshCw,
    accentColor: 'text-purple-400',
    borderActive: 'border-purple-500 shadow-purple-500/20',
    badgeBg: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
    path: '/lifecycle',
    inputs: ['Approved optimization candidates', 'Target bucket lifecycle schema'],
    awsOperation: '@aws-sdk/client-s3 : PutBucketLifecycleConfiguration',
    outputs: ['Lifecycle configuration review', 'AWS response for explicitly requested changes'],
  },
];

export const CoreWorkflowSection: React.FC = () => {
  const navigate = useNavigate();
  const [selectedStageId, setSelectedStageId] = useState<string>('store');

  const selectedStage =
    WORKFLOW_STAGES.find((s) => s.id === selectedStageId) || WORKFLOW_STAGES[0];

  return (
    <section id="workflow" className="relative py-20 lg:py-28 bg-white dark:bg-[#06090F] border-b border-white/[0.07] overflow-hidden scroll-mt-20">
      {/* Background Subtle Gradient */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[300px] bg-blue-500/[0.03] blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-mono text-[11px] font-semibold tracking-wider uppercase">
            End-To-End Infrastructure Pipeline
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight">
            The Five-Stage Core Workflow
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-sans max-w-2xl mx-auto">
            A review workflow from observed S3 inventory and AWS-published metrics to operator-approved storage decisions.
          </p>
        </div>

        {/* Continuous Horizontal System Diagram */}
        <div className="relative">
          {/* Connecting SVG Flow Line (Desktop) */}
          <div className="hidden lg:block absolute top-[52px] left-[5%] right-[5%] h-0.5 bg-gradient-to-r from-blue-500/30 via-amber-500/30 to-purple-500/30 -z-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400 to-transparent w-32 h-full animate-[pulse_3s_ease-in-out_infinite]" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 relative z-10">
            {WORKFLOW_STAGES.map((stage) => {
              const Icon = stage.icon;
              const isSelected = stage.id === selectedStageId;

              return (
                <button
                  key={stage.id}
                  onClick={() => setSelectedStageId(stage.id)}
                  className={`text-left p-5 rounded-lg transition-all border flex flex-col justify-between group cursor-pointer ${
                    isSelected
                      ? `bg-slate-900 border-white/[0.2] ${stage.borderActive} shadow-lg`
                      : 'bg-slate-900/40 border-white/[0.06] hover:bg-slate-900/70 hover:border-white/[0.12]'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Top Marker & Step */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border bg-slate-950/80 text-slate-500 dark:text-slate-400 border-white/[0.08]">
                        {stage.stageNumber}
                      </span>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-transform group-hover:scale-110 ${stage.badgeBg}`}>
                        <Icon className={`w-4 h-4 ${stage.accentColor}`} />
                      </div>
                    </div>

                    {/* Stage Label & Component */}
                    <div className="space-y-1">
                      <div className="text-xs font-mono font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                        {stage.label}
                      </div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white font-display group-hover:text-amber-300 transition-colors">
                        {stage.awsComponent}
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {stage.summary}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono">
                    <span className={isSelected ? 'text-amber-300 font-semibold' : 'text-slate-500'}>
                      {isSelected ? 'Active Inspector' : 'Click to inspect'}
                    </span>
                    <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'translate-x-1 text-amber-300' : 'text-slate-600'}`} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Technical Pipeline Inspector */}
        <div className="p-6 sm:p-8 rounded-lg bg-white dark:bg-[#0B101D] border border-white/[0.08] shadow-2xl">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${selectedStage.badgeBg}`}>
                <selectedStage.icon className={`w-5 h-5 ${selectedStage.accentColor}`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase">
                    Stage {selectedStage.stageNumber} • {selectedStage.label}
                  </span>
                  <span className="text-slate-600">/</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white font-display">
                    {selectedStage.awsComponent}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  {selectedStage.summary}
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate(selectedStage.path)}
              className="btn-secondary !py-2 !px-4 text-xs font-semibold shrink-0 flex items-center gap-2"
            >
              <span>Explore in Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Three-Column Technical Data Spec */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 text-xs">
            {/* Column 1: Stage Inputs */}
            <div className="space-y-2.5 p-4 rounded-xl bg-slate-950/50 border border-white/[0.05]">
              <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-blue-400" />
                <span>Input Feeds</span>
              </div>
              <ul className="space-y-1.5 text-slate-600 dark:text-slate-300 text-[11px] font-mono">
                {selectedStage.inputs.map((inp, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-slate-600">•</span>
                    <span>{inp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2: AWS SDK Operations */}
            <div className="space-y-2.5 p-4 rounded-xl bg-slate-950/50 border border-white/[0.05]">
              <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-3 h-3 text-amber-400" />
                <span>AWS SDK Execution</span>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-white/[0.04] text-[11px] font-mono text-amber-300 break-all leading-relaxed">
                {selectedStage.awsOperation}
              </div>
            </div>

            {/* Column 3: Output Artifacts */}
            <div className="space-y-2.5 p-4 rounded-xl bg-slate-950/50 border border-white/[0.05]">
              <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Produced Artifacts</span>
              </div>
              <ul className="space-y-1.5 text-slate-600 dark:text-slate-300 text-[11px] font-mono">
                {selectedStage.outputs.map((out, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-400">•</span>
                    <span>{out}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default CoreWorkflowSection;
