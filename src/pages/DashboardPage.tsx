import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HardDrive,
  Files,
  Database,
  Sparkles,
  ArrowRight,
  Eye,
  Globe,
  Layers3,
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { MetricCard } from '../components/common/MetricCard';
import { ChartCard } from '../components/common/ChartCard';
import { ActivityBadge, StatusBadge, StorageClassBadge } from '../components/common/Badges';
import { StorageClassDonut } from '../components/dashboard/StorageClassDonut';
import { StorageTrendChart } from '../components/dashboard/StorageTrendChart';
import { ActivityChart } from '../components/dashboard/ActivityChart';
import { RecentActivityList } from '../components/dashboard/RecentActivityList';
import { CardSkeleton, LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { OptimizationCandidate } from '../types';
import {
  getDashboardSummary,
  getStorageByClass,
  getStorageTrend,
  getActivityOverview,
  getRecentEvents,
} from '../services/dashboardService';
import { getOptimizationCandidates } from '../services/optimizationService';
import { useApp } from '../context/AppContext';
import { getRegionalInfrastructure } from '../services/regionalService';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { lastRefreshed, addToast } = useApp();

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [storageByClass, setStorageByClass] = useState<any[]>([]);
  const [storageTrend, setStorageTrend] = useState<any[]>([]);
  const [activityData, setActivityData] = useState<any[]>([]);
  const [activityStatus, setActivityStatus] = useState<'available' | 'pending' | 'unavailable'>('pending');
  const [activityReason, setActivityReason] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<OptimizationCandidate[]>([]);
  const [dashboardError, setDashboardError] = useState('');
  const [regionCount, setRegionCount] = useState<number | null>(null);

  useEffect(() => {
    getRegionalInfrastructure()
      .then((data) => setRegionCount(data.dataSource === 'LIVE_AWS' || data.dataSource === 'aws-s3-hybrid' ? data.regions.length : null))
      .catch(() => setRegionCount(null));
  }, [lastRefreshed]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        setDashboardError('');
        const [sum, classes, trend, act, evts, opps] = await Promise.all([
          getDashboardSummary(),
          getStorageByClass(),
          getStorageTrend(),
          getActivityOverview(),
          getRecentEvents(),
          getOptimizationCandidates(),
        ]);
        setSummary(sum);
        setStorageByClass(classes);
        setStorageTrend(trend);
        setActivityData(act.observations || []);
        setActivityStatus(act.status || 'unavailable');
        setActivityReason(act.reason || null);
        setEvents(evts);
        setOpportunities(opps.slice(0, 5)); // Top 5 high-impact opportunities on dashboard
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setDashboardError('Live dashboard summary could not be loaded. Reconnect to the backend; unavailable values are not replaced with sample metrics.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [lastRefreshed]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="S3 Storage Optimizer"
        subtitle="Monitor live S3 inventory, review published Storage Lens metrics, and evaluate evidence-based optimization opportunities."
        showDateRange={true}
        showRefresh={true}
      />

      {/* Summary KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : summary ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <MetricCard
            title="Total Storage"
            value={summary.totalStorageFormatted || `${summary.totalStorageTB} TB`}
            change={summary.totalStorageChangePercent ? `+${summary.totalStorageChangePercent}%` : undefined}
            changeType="positive"
            description="Total storage across monitored buckets"
            icon={HardDrive}
            subtext={summary.totalStorageBytes ? `${(summary.totalStorageBytes).toLocaleString()} bytes live` : 'Discovered in AWS'}
            badgeLabel={summary.dataSource || 'LIVE AWS'}
          />
          <MetricCard
            title="AWS Regions"
            value={regionCount === null ? 'Unavailable' : regionCount}
            description="Regions returned by AWS discovery"
            icon={Globe}
            badgeLabel={regionCount === null ? 'UNAVAILABLE' : 'LIVE AWS'}
            subtext={regionCount === null ? 'Regional inventory unavailable' : 'Derived from discovered bucket locations'}
          />
          <MetricCard
            title="Storage Classes"
            value={storageByClass.length ? storageByClass.filter((item) => Number(item.bytes || item.gb || item.tb) > 0).length : 'Unavailable'}
            description="Classes present in current S3 inventory"
            icon={Layers3}
            badgeLabel={storageByClass.length ? 'LIVE AWS' : 'UNAVAILABLE'}
            subtext={storageByClass.length ? 'Direct S3 inventory' : 'Inventory by class unavailable'}
          />
          <MetricCard
            title="Total Objects"
            value={summary.totalObjectsFormatted || `${summary.totalObjectsCount}`}
            change={summary.totalObjectsChangePercent ? `+${summary.totalObjectsChangePercent}%` : undefined}
            changeType="positive"
            description="Objects across monitored buckets"
            icon={Files}
            badgeLabel="LIVE AWS"
            subtext={summary.totalObjectsCount > 0 ? `${summary.totalObjectsCount} objects indexed` : '0 objects in discovered buckets'}
          />
          <MetricCard
            title="Monitored Buckets"
            value={summary.monitoredBucketsCount}
            change={summary.monitoredBucketsChange ? `+${summary.monitoredBucketsChange}` : undefined}
            changeType="neutral"
            description="Active S3 buckets"
            icon={Database}
            badgeLabel="LIVE AWS"
            subtext="Discovered in AWS Account"
          />
          <MetricCard
            title="Optimization Candidates"
            value={summary.optimizationCandidatesCount}
            change={summary.optimizationCandidatesChange ? `${summary.optimizationCandidatesChange} this month` : undefined}
            changeType="positive"
            description="Storage segments for tiering review"
            icon={Sparkles}
            badgeLabel="CALCULATED"
            subtext={summary.estimatedMonthlySavings > 0 ? `Est. $${summary.estimatedMonthlySavings.toFixed(4)}/mo · ESTIMATED` : 'Storage candidates identified'}
          />
        </div>
      ) : (
        <div role="status" className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
          <strong className="block">Live dashboard data unavailable</strong>
          <span className="mt-1 block text-xs">{dashboardError || 'The backend did not return a current inventory summary.'}</span>
        </div>
      )}

      {/* Storage Overview Section: Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Storage by Class Donut */}
        <div className="lg:col-span-5">
          <ChartCard
            title="Storage by Class"
            subtitle="Current distribution across S3 storage tiers"
            footer={
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>
                  {storageByClass.length ? <>Standard tier represents{' '}{storageByClass.find((c) => c.key === 'STANDARD')?.percentage ?? 0}% of footprint</> : 'Storage class breakdown unavailable'}
                </span>
                <span className="font-mono text-amber-700 dark:text-amber-400 font-semibold">
                  {summary?.totalStorageFormatted || (summary ? `${summary.totalStorageTB} TB Total` : 'Unavailable')}
                </span>
              </div>
            }
          >
            {loading ? (
              <LoadingSkeleton rows={3} />
            ) : (
              <StorageClassDonut data={storageByClass} />
            )}
          </ChartCard>
        </div>

        {/* Right: Storage Trend Line/Area Chart */}
        <div className="lg:col-span-7">
          <ChartCard
            title="Storage Trend"
            subtitle="Storage growth and tier observation from AWS S3 Storage Lens"
            footer={
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>{storageTrend.length ? 'Current S3 inventory observation' : 'Storage trend observation unavailable'}</span>
                <button
                  onClick={() => navigate('/analytics')}
                  className="text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 font-semibold inline-flex items-center gap-1 transition-colors"
                >
                  View deep analytics <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            }
          >
            {loading ? (
              <LoadingSkeleton rows={4} />
            ) : (
              <StorageTrendChart data={storageTrend} />
            )}
          </ChartCard>
        </div>
      </div>

      {/* Activity Overview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Activity Chart */}
        <div className="lg:col-span-8">
          <ChartCard
            title="Activity Overview"
            subtitle="Verified request and egress observations, when AWS has published them"
            action={
              <span className="text-[10px] font-mono text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] px-2 py-1 rounded-md">
                {activityStatus === 'available' ? 'STORAGE LENS · DAILY' : activityStatus.toUpperCase()}
              </span>
            }
            footer={
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>Published Storage Lens daily observations only; missing points remain unavailable.</span>
                <span className="text-slate-600 dark:text-slate-400 font-mono">{activityStatus === 'available' ? `${activityData.length} observations` : 'No datapoints'}</span>
              </div>
            }
          >
            {loading ? (
              <LoadingSkeleton rows={4} />
            ) : (
              <ActivityChart data={activityData} status={activityStatus} reason={activityReason} />
            )}
          </ChartCard>
        </div>

        {/* Recent System Activity */}
        <div className="lg:col-span-4">
          <div className="aws-card p-5 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
                  Recent Activity
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">
                  Current observation
                </span>
              </div>
              {loading ? (
                <LoadingSkeleton rows={4} />
              ) : (
                <RecentActivityList events={events.slice(0, 5)} />
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/[0.07] flex items-center justify-between">
              <span className="text-xs text-slate-500">{events.length} current records</span>
              <button
                onClick={() => {
                  addToast('Current Inventory Record', 'Showing current S3 inventory observations only; historical event data is unavailable.', 'info');
                }}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
              >
                Refresh Log
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Optimization Opportunities Section */}
      <div className="aws-card overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-white/[0.02]">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white font-display tracking-tight">
                Top Optimization Opportunities
              </h2>
              <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-500/30 font-mono">
                {opportunities.length} candidates highlighted
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Inventory-based review candidates are listed below. Access activity is unavailable unless AWS publishes authoritative observations.
            </p>
          </div>

          <button
            onClick={() => navigate('/optimization')}
            className="btn-primary !text-xs !py-1.5 !px-3 shrink-0"
          >
            <span>Open Optimization Center</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="aws-table-th">Prefix / Segment</th>
                <th className="aws-table-th">Storage</th>
                <th className="aws-table-th">Observed Activity</th>
                <th className="aws-table-th">Current Class</th>
                <th className="aws-table-th">Recommendation</th>
                <th className="aws-table-th">Status</th>
                <th className="aws-table-th text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
              {opportunities.map((opp) => (
                <tr key={opp.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors">
                  <td className="aws-table-td">
                    <div>
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                        {opp.prefix}
                      </span>
                      <span className="block text-[11px] text-slate-500 font-mono">
                        Bucket: {opp.bucket}
                      </span>
                    </div>
                  </td>
                  <td className="aws-table-td font-mono font-semibold text-slate-200">
                    {opp.storageFormatted}
                  </td>
                  <td className="aws-table-td">
                    <ActivityBadge level={opp.activityLevel} />
                  </td>
                  <td className="aws-table-td">
                    <StorageClassBadge storageClass={opp.currentStorageClass} />
                  </td>
                  <td className="aws-table-td">
                    <span className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                      {opp.recommendation}
                    </span>
                    <span className="block text-[11px] text-slate-500">
                      Reason: {opp.reason}
                    </span>
                  </td>
                  <td className="aws-table-td">
                    <StatusBadge status={opp.status} />
                  </td>
                  <td className="aws-table-td text-right">
                    <button
                      onClick={() => navigate('/optimization')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 rounded-lg transition-colors"
                      title="Review candidate in Optimization Center"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
