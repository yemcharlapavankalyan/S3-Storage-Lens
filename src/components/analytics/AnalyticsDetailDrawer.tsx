import React from 'react';
import { DetailDrawer } from '../common/DetailDrawer';
import { AnalyticsPrefixRecord } from '../../types';
import { ActivityBadge, StorageClassBadge } from '../common/Badges';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  HardDrive,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AnalyticsDetailDrawerProps {
  record: AnalyticsPrefixRecord | null;
  onClose: () => void;
}

export const AnalyticsDetailDrawer: React.FC<AnalyticsDetailDrawerProps> = ({
  record,
  onClose,
}) => {
  const navigate = useNavigate();

  if (!record) return null;

  const hasRequests = record.getRequests != null;
  const hasDownloads = record.downloadedGB != null;

  return (
    <DetailDrawer
      isOpen={!!record}
      onClose={onClose}
      title="Prefix Storage Analytics"
      subtitle={`${record.bucket}${record.prefix}`}
      badge={<ActivityBadge level={record.activityLevel} />}
      footer={
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              navigate('/optimization');
            }}
            className="btn-primary !w-full"
          >
            <Sparkles className="w-4 h-4 mr-1.5" />
            Evaluate in Optimization Center
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Core Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 bg-white/[0.03] rounded-xl border border-white/[0.08]">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block font-sans">
              Stored Volume
            </span>
            <span className="text-xl font-bold font-mono text-white mt-1 block">
              {record.storageFormatted}
            </span>
            <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">
              {record.storageGB} GB Total
            </span>
          </div>

          <div className="p-3.5 bg-white/[0.03] rounded-xl border border-white/[0.08]">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block font-sans">
              Total Objects
            </span>
            <span className="text-xl font-bold font-mono text-white mt-1 block">
              {record.objectsFormatted}
            </span>
            <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">
              {record.objects.toLocaleString()} objects
            </span>
          </div>

          <div className="p-3.5 bg-white/[0.03] rounded-xl border border-white/[0.08]">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block font-sans">
              Storage Tier
            </span>
            <div className="mt-1.5">
              <StorageClassBadge storageClass={record.storageClass} />
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Current S3 Class
            </span>
          </div>

          <div className="p-3.5 bg-white/[0.03] rounded-xl border border-white/[0.08]">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block font-sans">
              Data Source
            </span>
            <span className="text-xs font-semibold text-emerald-400 mt-1.5 block font-mono">
              {record.dataSource || 'LIVE_AWS'}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              Discovered from AWS S3
            </span>
          </div>
        </div>

        {/* Request Activity Breakdown */}
        <div className="aws-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-display">
              Observed Request Traffic
            </h4>
            {!hasRequests && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                FREE TIER: UNAVAILABLE
              </span>
            )}
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05]">
              <div className="flex items-center gap-2 text-slate-300">
                <ArrowDownCircle className="w-4 h-4 text-amber-400" />
                <span>GET Requests (Retrieval)</span>
              </div>
              <span className="font-mono font-bold text-white">
                {hasRequests ? record.getRequests?.toLocaleString() : 'N/A'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05]">
              <div className="flex items-center gap-2 text-slate-300">
                <ArrowUpCircle className="w-4 h-4 text-blue-400" />
                <span>PUT Requests (Ingestion)</span>
              </div>
              <span className="font-mono font-bold text-white">
                {record.putRequests != null
                  ? record.putRequests.toLocaleString()
                  : 'N/A'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05]">
              <div className="flex items-center gap-2 text-slate-300">
                <HardDrive className="w-4 h-4 text-emerald-400" />
                <span>Downloaded Egress Volume</span>
              </div>
              <span className="font-mono font-bold text-white">
                {hasDownloads ? `${record.downloadedGB} GB` : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Storage Lens Diagnostic Notes */}
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs">
          <div className="flex items-center gap-2 text-amber-300 font-bold mb-1 font-display">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Storage Lens Analysis
          </div>
          <p className="text-slate-300 leading-relaxed">
            {hasDownloads ? (
              <>
                This prefix demonstrates an access ratio of{' '}
                <strong className="text-amber-300 font-mono">
                  {(
                    (record.downloadedGB || 0) / Math.max(record.storageGB, 1)
                  ).toFixed(3)}{' '}
                  GB downloaded / GB stored
                </strong>
                . Low request velocity indicates that moving from STANDARD to an
                infrequent-access or intelligent-tiering strategy could minimize
                storage expenditure.
              </>
            ) : (
              <>
                Request metrics and network download volumes are not recorded by default in
                the free tier of AWS S3 Storage Lens. This prefix has{' '}
                <strong className="text-amber-300 font-mono">
                  {record.objectsFormatted} objects ({record.storageFormatted})
                </strong>{' '}
                residing in the <strong className="text-white font-mono">{record.storageClass}</strong> tier.
                Enable CloudWatch Request Metrics to track access velocity.
              </>
            )}
          </p>
        </div>
      </div>
    </DetailDrawer>
  );
};
