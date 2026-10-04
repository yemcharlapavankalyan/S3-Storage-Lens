import React, { useState } from 'react';
import { DetailDrawer } from '../common/DetailDrawer';
import { OptimizationCandidate, CandidateStatus } from '../../types';
import {
  ActivityBadge,
  PriorityBadge,
  StorageClassBadge,
  StatusBadge,
} from '../common/Badges';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Info,
  DollarSign,
  TrendingDown,
  ArrowRight,
  HardDrive,
  Files,
  ArrowDownCircle,
  ArrowUpCircle,
  ShieldAlert,
} from 'lucide-react';
import { ConfirmationModal } from '../common/ConfirmationModal';

interface OptimizationReviewModalProps {
  candidate: OptimizationCandidate | null;
  onClose: () => void;
  onStatusChange: (id: string, status: CandidateStatus) => void;
}

export const OptimizationReviewModal: React.FC<OptimizationReviewModalProps> = ({
  candidate,
  onClose,
  onStatusChange,
}) => {
  const [confirmAction, setConfirmAction] = useState<'approve' | 'reject' | null>(null);

  if (!candidate) return null;

  const handleApprove = () => {
    onStatusChange(candidate.id, 'APPROVED');
    setConfirmAction(null);
    onClose();
  };

  const handleReject = () => {
    onStatusChange(candidate.id, 'REJECTED');
    setConfirmAction(null);
    onClose();
  };

  return (
    <>
      <DetailDrawer
        isOpen={!!candidate}
        onClose={onClose}
        title="Optimization Candidate Review"
        subtitle={`${candidate.bucket}${candidate.prefix}`}
        width="max-w-2xl"
        badge={<PriorityBadge priority={candidate.priority} />}
        footer={
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <StatusBadge status={candidate.status} />
              <span>Current Evaluation State</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setConfirmAction('reject')}
                className="btn-secondary !text-xs !py-2 !px-3 text-rose-700 hover:text-rose-800 hover:bg-rose-50 border-rose-200"
              >
                <XCircle className="w-4 h-4 mr-1 text-rose-500" />
                Reject
              </button>
              <button
                type="button"
                onClick={() => setConfirmAction('approve')}
                className="btn-primary !text-xs !py-2 !px-4 bg-emerald-600 hover:bg-emerald-700"
              >
                <CheckCircle2 className="w-4 h-4 mr-1 text-white" />
                Approve Recommendation
              </button>
            </div>
          </div>
        }
      >
        <div className="space-y-6 text-xs">
          {/* Top disclaimer note */}
          <div className="p-3 bg-amber-50/70 border border-amber-200/90 rounded-lg flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-slate-600 leading-relaxed">
              <strong>Academic Frontend Prototype:</strong> Recommendations are advisory candidates derived from S3 Storage Lens metrics. Approving or rejecting updates the prototype state only and does not execute AWS SDK or CloudTrail calls.
            </p>
          </div>

          {/* Metric Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">
                Current Storage
              </span>
              <span className="text-lg font-bold font-mono text-slate-900 mt-1 block">
                {candidate.storageFormatted}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {candidate.storageGB} GB
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">
                Object Count
              </span>
              <span className="text-lg font-bold font-mono text-slate-900 mt-1 block">
                {candidate.objectCountFormatted}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {candidate.objectCount.toLocaleString()} items
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">
                Observed Activity
              </span>
              <div className="mt-1.5">
                <ActivityBadge level={candidate.activityLevel} />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Last 90 days
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">
                Current Tier
              </span>
              <div className="mt-1.5">
                <StorageClassBadge storageClass={candidate.currentStorageClass} />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Target: {candidate.targetStorageClass}
              </span>
            </div>
          </div>

          {/* Evidence Used Card */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-200/90 rounded-lg">
            <span className="text-[10px] uppercase font-bold text-blue-900 block mb-1 tracking-wider">
              AWS Discovery Evidence Used
            </span>
            <p className="text-slate-700 font-sans leading-relaxed">
              {candidate.evidenceUsed || candidate.reason}
            </p>
          </div>

          {/* Observed Request Metrics */}
          <div className="aws-card p-4">
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                Traffic & Request Metrics
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                {candidate.accessMetricsStatus || (candidate.getRequests != null ? 'LIVE' : 'UNAVAILABLE')}
              </span>
            </div>

            {candidate.getRequests != null ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
                <div className="p-2.5 bg-slate-50 rounded border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <ArrowDownCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>GET Requests:</span>
                  </div>
                  <span className="font-bold text-slate-900">{candidate.getRequests.toLocaleString()}</span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <ArrowUpCircle className="w-3.5 h-3.5 text-blue-600" />
                    <span>PUT Requests:</span>
                  </div>
                  <span className="font-bold text-slate-900">{(candidate.putRequests || 0).toLocaleString()}</span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Downloaded:</span>
                  </div>
                  <span className="font-bold text-slate-900">{candidate.downloadedGB || 0} GB</span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 rounded border border-slate-200 text-center">
                <p className="text-xs text-slate-500 font-sans">
                  <strong>GET / PUT / Egress: N/A</strong> — CloudWatch request metrics are not enabled for this S3 bucket.
                </p>
                <span className="text-[10px] text-slate-400 block mt-1 font-mono">
                  S3 Storage Lens Free Tier does not record request telemetry without CloudWatch 1-minute request metrics.
                </span>
              </div>
            )}
          </div>

          {/* Analysis & Recommendation Section */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
            <div>
              <h4 className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Storage Lens Analysis
              </h4>
              <p className="mt-1 text-slate-700 leading-relaxed font-sans">
                {candidate.analysisText}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <h4 className="text-xs font-bold text-slate-900 tracking-tight">
                Recommended Action
              </h4>
              <p className="mt-1 text-slate-700 leading-relaxed font-medium">
                {candidate.recommendation}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <h4 className="text-xs font-bold text-slate-900 tracking-tight mb-1.5">
                Why this recommendation?
              </h4>
              <ul className="list-disc pl-4 space-y-1 text-slate-600">
                {candidate.whyFactors.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Potential Impact & Confidence */}
          <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-lg flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
                  Estimated Monthly Cost Difference
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {candidate.savingsType || 'ESTIMATED FROM S3 STORAGE VOLUME'}
                </span>
              </div>
              <p className="text-sm font-bold text-emerald-950 mt-1">
                {candidate.potentialImpactText}
              </p>
              <span className="text-[10px] text-emerald-700/80 mt-0.5 block">
                {candidate.savingsFormatted ? `Estimated Savings: ${candidate.savingsFormatted}` : `Est. ~${candidate.estimatedMonthlyDifference > 0 ? `$${candidate.estimatedMonthlyDifference.toFixed(4)}/month` : 'Hygiene rule'}`} (Based on AWS S3 pricing)
              </span>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">
                Confidence Level
              </span>
              <span className="text-xs font-bold font-mono px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded border border-emerald-300 inline-block mt-1">
                {candidate.confidence} Confidence
              </span>
            </div>
          </div>
        </div>
      </DetailDrawer>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmAction !== null}
        onClose={() => setConfirmAction(null)}
        onConfirm={confirmAction === 'approve' ? handleApprove : handleReject}
        title={confirmAction === 'approve' ? 'Approve Recommendation?' : 'Reject Recommendation?'}
        description={
          confirmAction === 'approve'
            ? `Are you sure you want to approve "${candidate.recommendation}" for prefix "${candidate.prefix}" in bucket "${candidate.bucket}"? This updates frontend simulation status.`
            : `Are you sure you want to dismiss the optimization candidate for "${candidate.prefix}"?`
        }
        confirmLabel={confirmAction === 'approve' ? 'Approve' : 'Reject Candidate'}
        variant={confirmAction === 'approve' ? 'success' : 'danger'}
      />
    </>
  );
};
