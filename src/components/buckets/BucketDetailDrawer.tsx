import React from 'react';
import { DetailDrawer } from '../common/DetailDrawer';
import { Bucket } from '../../types';
import { StatusBadge, ActivityBadge, StorageClassBadge } from '../common/Badges';
import {
  Database,
  Lock,
  History,
  FolderGit2,
  HardDrive,
  Files,
  ExternalLink,
  Sparkles,
  Info,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { formatBytes } from '../../utils/formatters';

interface BucketDetailDrawerProps {
  bucket: Bucket | null;
  onClose: () => void;
}

export const BucketDetailDrawer: React.FC<BucketDetailDrawerProps> = ({
  bucket,
  onClose,
}) => {
  const navigate = useNavigate();

  if (!bucket) return null;

  const storageDisplay =
    (bucket as any).storageFormatted ||
    formatBytes((bucket as any).storageBytes || (bucket.storageTB ? bucket.storageTB * 1024 * 1024 * 1024 * 1024 : 0));

  return (
    <DetailDrawer
      isOpen={!!bucket}
      onClose={onClose}
      title={bucket.name}
      subtitle={`AWS Region: ${bucket.region}`}
      width="max-w-2xl"
      badge={<StatusBadge status={bucket.status} />}
      footer={
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              navigate('/optimization');
            }}
            className="btn-primary !text-xs !w-full"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            Check Bucket Optimization Candidates
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Bucket Properties Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] uppercase font-semibold text-slate-500 block">
              Total Storage
            </span>
            <span className="text-base font-bold font-mono text-slate-900 mt-1 block">
              {storageDisplay}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] uppercase font-semibold text-slate-500 block">
              Total Objects
            </span>
            <span className="text-base font-bold font-mono text-slate-900 mt-1 block">
              {bucket.objectsFormatted || `${bucket.objects}`}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] uppercase font-semibold text-slate-500 block">
              Versioning
            </span>
            <span className="text-xs font-semibold text-slate-800 mt-1.5 flex items-center gap-1">
              <History className="w-3.5 h-3.5 text-slate-500" />
              {bucket.versioning ? 'Enabled' : 'Disabled'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] uppercase font-semibold text-slate-500 block">
              Encryption
            </span>
            <span className="text-xs font-semibold text-slate-800 mt-1.5 flex items-center gap-1 truncate">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              {bucket.encryption ? bucket.encryption.split(' ')[0] : 'SSE-S3'}
            </span>
          </div>
        </div>

        {/* 6-Month Bucket Growth Chart */}
        <div className="aws-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
              Storage Volume Growth Trend
            </h4>
            <span className="text-[11px] font-mono text-slate-400">
              Storage Lens Aggregate
            </span>
          </div>

          {!bucket.growthTrend || bucket.growthTrend.length <= 1 ? (
            <div className="py-8 px-4 text-center bg-slate-50 rounded border border-slate-200">
              <Info className="w-5 h-5 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">
                Historical Growth Trend Unavailable
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 max-w-sm mx-auto">
                Daily historical time-series for {bucket.name} requires S3 Storage Lens Advanced Tier or CloudWatch daily aggregation.
              </p>
              <div className="mt-3 inline-flex items-center gap-2 px-2.5 py-1 bg-white border border-slate-200 rounded text-[11px] font-mono text-slate-700">
                <span>Current Observation:</span>
                <strong className="text-amber-600">{storageDisplay}</strong>
              </div>
            </div>
          ) : (
            <div className="w-full h-44">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={bucket.growthTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`bucketGrad-${bucket.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF9900" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#FF9900" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#94A3B8"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) => `${val} TB`}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-slate-900 text-white text-xs p-2 rounded shadow font-mono">
                            <p>{label}: <strong className="text-amber-400">{payload[0].value}</strong></p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="storageTB"
                    stroke="#FF9900"
                    strokeWidth={2}
                    fill={`url(#bucketGrad-${bucket.id})`}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Storage Class Distribution */}
        <div className="aws-card p-4">
          <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider mb-3">
            Storage Class Breakdown
          </h4>
          <div className="space-y-3">
            {bucket.storageByClass.map((sc) => (
              <div key={sc.class} className="text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-slate-700 font-medium">
                    {sc.class}
                  </span>
                  <span className="font-mono text-slate-900 font-semibold">
                    {(sc as any).formattedStorage || formatBytes((sc as any).bytes || (sc.gb ? sc.gb * 1024 * 1024 * 1024 : 0))} ({sc.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-amber-500 h-2 rounded-full"
                    style={{ width: `${sc.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Prefixes Breakdown */}
        <div className="aws-card p-4">
          <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider mb-3">
            Top Prefixes & Storage Allocation
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px]">
                  <th className="pb-2">Prefix</th>
                  <th className="pb-2">Storage</th>
                  <th className="pb-2">Objects</th>
                  <th className="pb-2">Tier</th>
                  <th className="pb-2">Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {bucket.prefixes.map((p) => (
                  <tr key={p.prefix} className="hover:bg-slate-50">
                    <td className="py-2 text-slate-800 font-semibold">{p.prefix}</td>
                    <td className="py-2 text-slate-700">{(p as any).storageFormatted || formatBytes((p as any).storageBytes || (p.storageGB ? p.storageGB * 1024 * 1024 * 1024 : 0))}</td>
                    <td className="py-2 text-slate-600">{p.objects.toLocaleString()}</td>
                    <td className="py-2">
                      <StorageClassBadge storageClass={p.storageClass} />
                    </td>
                    <td className="py-2">
                      <ActivityBadge level={p.activity} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DetailDrawer>
  );
};
