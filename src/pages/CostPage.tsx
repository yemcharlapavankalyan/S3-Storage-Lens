import React, { useEffect, useState } from 'react';
import {
  DollarSign,
  TrendingDown,
  HardDrive,
  Info,
  ShieldAlert,
  ArrowRight,
  PieChart as PieIcon,
  BarChart3,
  CheckCircle,
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { MetricCard } from '../components/common/MetricCard';
import { ChartCard } from '../components/common/ChartCard';
import { StorageClassBadge } from '../components/common/Badges';
import { ProvenanceBadge } from '../components/common/ProvenanceBadge';
import { LoadingSkeleton, CardSkeleton } from '../components/common/LoadingSkeleton';
import { CostAnalysis } from '../types';
import { getCostAnalysis } from '../services/costService';
import { useApp } from '../context/AppContext';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const CostPage: React.FC = () => {
  const { lastRefreshed, addToast } = useApp();

  const [loading, setLoading] = useState(true);
  const [costData, setCostData] = useState<CostAnalysis | null>(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await getCostAnalysis();
        setCostData(data);
      } catch (err) {
        console.error('Failed to load cost analysis:', err);
        setLoadError('The backend did not return a cost estimate. No sample values are substituted.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [lastRefreshed]);

  const customTrendTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white text-xs p-3 rounded shadow-lg border border-slate-700 font-mono">
          <p className="font-semibold text-slate-200 mb-1">{label} 2026</p>
          <p className="text-slate-300">
            Current Baseline: <span className="text-amber-400 font-bold">${payload[0]?.value}</span>
          </p>
          {payload[1] && (
            <p className="text-slate-300">
              With Optimizations: <span className="text-emerald-400 font-bold">${payload[1]?.value}</span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Cost Analysis"
        subtitle="Understand estimated storage-cost impact, tier variance, and optimization opportunities."
        showDateRange={false}
        showRefresh={true}
      />

      {/* Cost Provenance and Status Banner */}
      <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-xs flex items-start gap-3 text-slate-800 dark:bg-blue-500/10 dark:border-blue-500/30 dark:text-slate-200">
        <Info className="w-4 h-4 text-blue-700 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <strong className="font-semibold text-slate-900 dark:text-white">
              Billing Source: ESTIMATED FROM S3 STORAGE VOLUME
            </strong>
            <ProvenanceBadge value="UNAVAILABLE" />
          </div>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            AWS Cost Explorer billing is unavailable. Any estimate is modeled from discovered S3 inventory ({costData?.storageUnderReviewFormatted || 'Unavailable'}) using this pricing basis: {costData?.pricingBasis || 'Unavailable'}. This is not invoiced billing; rates vary by region.
          </p>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : !costData ? (
        <div role="status" className="aws-card p-5 text-sm text-slate-700 dark:text-slate-300"><strong className="block text-slate-900 dark:text-white">Cost estimate unavailable</strong><p className="mt-1 text-xs">{loadError || 'The cost API returned no estimate.'}</p></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Estimated Monthly Cost"
            value={(costData as any).currentMonthlyCostFormatted || '< $0.01/mo'}
            description="Modeled monthly S3 storage expense"
            icon={DollarSign}
            badgeLabel="ESTIMATED"
            subtext="ESTIMATED FROM S3 STORAGE VOLUME"
          />
          <MetricCard
            title="Actual AWS Billing Status"
            value="Unavailable"
            description="AWS Cost Explorer not configured"
            icon={ShieldAlert}
            changeType="neutral"
            badgeLabel="UNAVAILABLE"
            subtext="ce:GetCostAndUsage required"
          />
          <MetricCard
            title="Potential Savings"
            value="Unavailable"
            description="No verified scenario model is available"
            icon={TrendingDown}
            changeType="neutral"
            badgeLabel="UNAVAILABLE"
            subtext="No savings percentage is assumed"
          />
          <MetricCard
            title="Storage Under Review"
            value={(costData as any).storageUnderReviewFormatted || `${costData.storageUnderReviewTB} TB`}
            description="Volume evaluated for cost tiering"
            icon={HardDrive}
            subtext="Storage classes from direct inventory"
            badgeLabel="LIVE AWS"
          />
        </div>
      )}

      {/* Cost Charts Section: Two Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Monthly Cost Trend */}
        <div className="lg:col-span-7">
          <ChartCard
            title="Monthly Estimated Cost Trend"
            subtitle="Historical billing series, when AWS Cost Explorer data is available"
            footer={
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Calculated from live AWS S3 discovery</span>
                <span className="font-mono text-slate-400">
                  ESTIMATED FROM S3 STORAGE VOLUME
                </span>
              </div>
            }
          >
            {loading ? (
              <LoadingSkeleton rows={4} />
            ) : !costData ? (
              <div className="flex h-64 items-center justify-center text-sm text-slate-600 dark:text-slate-300">Cost estimate unavailable.</div>
            ) : !costData.costTrend || costData.costTrend.length <= 1 ? (
              <div className="w-full h-64 flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 mb-3">
                  <Info className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">
                  Historical Billing Trend Unavailable
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md leading-relaxed">
                  AWS Cost Explorer is not configured for this AWS account. Monthly historical billing time-series requires Cost Explorer (ce:GetCostAndUsage) API access and historical invoice data.
                </p>
              </div>
            ) : (
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={costData.costTrend}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <YAxis
                      stroke="#94A3B8"
                      fontSize={11}
                      tickLine={false}
                      tickFormatter={(val) => `$${val}`}
                    />
                    <Tooltip content={customTrendTooltip} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar
                      dataKey="currentCost"
                      name="Current Baseline ($)"
                      fill="#94A3B8"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={28}
                    />
                    <Line
                      type="monotone"
                      dataKey="projectedCost"
                      name="Optimized ($)"
                      stroke="#10B981"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#10B981' }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
          </ChartCard>
        </div>

        {/* Right: Cost by Storage Class */}
        <div className="lg:col-span-5">
          <ChartCard
            title="Cost by Storage Class"
            subtitle="Estimated storage cost using the displayed pricing basis"
            footer={
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{costData?.totalStorageBytes ? `${costData.costByClass.find((item) => item.storageClass === 'S3 Standard')?.percentage ?? 'Unavailable'}% of observed bytes in S3 Standard` : 'Storage-class distribution unavailable'}</span>
                <span className="font-mono text-slate-700 font-medium">{(costData as any)?.currentMonthlyCostFormatted || '< $0.01/mo'}</span>
              </div>
            }
          >
            {loading ? (
              <LoadingSkeleton rows={4} />
            ) : !costData || Number(costData.totalStorageBytes || 0) === 0 ? (
              <div className="flex h-64 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300">Cost by storage class unavailable without a non-empty live inventory.</div>
            ) : (
              <div className="w-full flex flex-col items-center">
                <div className="w-full h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={costData.costByClass}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="cost"
                        stroke="#fff"
                        strokeWidth={2}
                      >
                        {costData.costByClass.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const p = payload[0].payload;
                            return (
                              <div className="bg-slate-900 text-white text-xs p-2 rounded shadow font-mono">
                                <p className="font-semibold">{p.storageClass}</p>
                                <p className="text-amber-400">{p.formattedCost} · {p.percentage}% of bytes</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="w-full grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                  {costData.costByClass.map((c) => (
                    <div key={c.storageClass} className="flex items-center justify-between p-1.5 rounded bg-slate-50">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                        <span className="truncate text-slate-700 font-medium">{c.storageClass}</span>
                      </div>
                      <span className="font-mono font-bold text-slate-900 ml-1">{c.formattedCost}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </ChartCard>
        </div>
      </div>

      {/* Segment Cost Comparison Table */}
      <div className="aws-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
            Storage Segment Cost Comparison
          </span>
          <span className="text-xs text-slate-500 font-mono">
            Model: Regional S3 storage-class rate estimate | ESTIMATED FROM S3 STORAGE VOLUME
          </span>
        </div>

        {loading ? (
          <LoadingSkeleton rows={6} />
        ) : !costData ? (
          <div className="p-6 text-sm text-slate-600 dark:text-slate-300">Cost comparison unavailable because the cost API did not return inventory-backed estimates.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="aws-table-th">Storage Segment</th>
                  <th className="aws-table-th">Volume</th>
                  <th className="aws-table-th">Current Class</th>
                  <th className="aws-table-th">Current Estimated Cost</th>
                  <th className="aws-table-th">Recommended Strategy</th>
                  <th className="aws-table-th">Estimated Cost</th>
                  <th className="aws-table-th">Estimated Difference</th>
                  <th className="aws-table-th">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {costData.comparisonSegments.map((seg) => (
                  <tr key={seg.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="aws-table-td">
                      <div>
                        <span className="font-mono text-xs font-semibold text-slate-900 block">
                          {seg.segment}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {seg.bucket}
                        </span>
                      </div>
                    </td>
                    <td className="aws-table-td font-mono font-medium text-slate-700">
                      {seg.storageSize}
                    </td>
                    <td className="aws-table-td">
                      <StorageClassBadge storageClass={seg.currentClass} />
                    </td>
                    <td className="aws-table-td font-mono font-semibold text-slate-800">
                      {typeof seg.currentEstimatedCost === 'number'
                        ? (seg.currentEstimatedCost > 0.01 ? `$${seg.currentEstimatedCost.toFixed(2)}/mo` : '< $0.01/mo')
                        : `${seg.currentEstimatedCost}/mo`}
                    </td>
                    <td className="aws-table-td text-xs text-slate-700 max-w-xs">
                      {seg.recommendedStrategy}
                    </td>
                    <td className="aws-table-td font-mono font-semibold text-emerald-700">
                      {typeof seg.estimatedCost === 'number'
                        ? (seg.estimatedCost > 0.01 ? `$${seg.estimatedCost.toFixed(2)}/mo` : '< $0.01/mo')
                        : `${seg.estimatedCost}/mo`}
                    </td>
                    <td className="aws-table-td font-mono font-bold text-emerald-600">
                      {typeof seg.estimatedDifference === 'number'
                        ? (seg.estimatedDifference > 0.01 ? `-$${seg.estimatedDifference.toFixed(2)}/mo` : '< $0.01/mo')
                        : `${seg.estimatedDifference}/mo`}
                    </td>
                    <td className="aws-table-td">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {seg.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
