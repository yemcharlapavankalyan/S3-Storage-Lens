import React, { useEffect, useState, useMemo } from 'react';
import {
  HardDrive,
  Files,
  ArrowDownCircle,
  ArrowUpCircle,
  Download,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckSquare,
  Square,
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { MetricCard } from '../components/common/MetricCard';
import { ChartCard } from '../components/common/ChartCard';
import { FilterBar } from '../components/common/FilterBar';
import { ActivityBadge, StorageClassBadge } from '../components/common/Badges';
import { StorageClassDonut } from '../components/dashboard/StorageClassDonut';
import { StorageTrendChart } from '../components/dashboard/StorageTrendChart';
import { AnalyticsDetailDrawer } from '../components/analytics/AnalyticsDetailDrawer';
import { StorageLensExportPanel } from '../components/analytics/StorageLensExportPanel';
import { LoadingSkeleton, CardSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { AnalyticsPrefixRecord, AnalyticsKpis, Bucket } from '../types';
import {
  getAnalyticsKpis,
  getAnalyticsPrefixRecords,
  getObjectCountTrend,
  getDownloadedBytesTrend,
} from '../services/analyticsService';
import { getStorageByClass, getStorageTrend } from '../services/dashboardService';
import { getBuckets } from '../services/bucketService';
import { useApp } from '../context/AppContext';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const { lastRefreshed, globalSearch, setGlobalSearch, addToast } = useApp();

  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<AnalyticsKpis | null>(null);
  const [records, setRecords] = useState<AnalyticsPrefixRecord[]>([]);
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [storageByClass, setStorageByClass] = useState<any[]>([]);
  const [storageTrend, setStorageTrend] = useState<any[]>([]);
  const [objectTrend, setObjectTrend] = useState<any[]>([]);
  const [downloadedTrend, setDownloadedTrend] = useState<any[]>([]);

  // Filter state
  const [searchQuery, setSearchQuery] = useState(globalSearch);
  const [selectedBucket, setSelectedBucket] = useState('ALL');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedActivity, setSelectedActivity] = useState('ALL');

  // Table sorting & pagination
  const [sortField, setSortField] = useState<keyof AnalyticsPrefixRecord>('storageBytes');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Selected row for detail drawer
  const [activeRecord, setActiveRecord] = useState<AnalyticsPrefixRecord | null>(null);
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());

  // Chart view tab
  const [chartTab, setChartTab] = useState<'growth' | 'objects' | 'egress'>('growth');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [kpiData, recs, bList, classes, sTrend, oTrend, dTrend] = await Promise.allSettled([
          getAnalyticsKpis(),
          getAnalyticsPrefixRecords(),
          getBuckets(),
          getStorageByClass(),
          getStorageTrend(),
          getObjectCountTrend(),
          getDownloadedBytesTrend(),
        ]);
        setKpis(kpiData.status === 'fulfilled' ? kpiData.value : null);
        setRecords(recs.status === 'fulfilled' ? recs.value : []);
        setBuckets(bList.status === 'fulfilled' ? bList.value : []);
        setStorageByClass(classes.status === 'fulfilled' ? classes.value : []);
        setStorageTrend(sTrend.status === 'fulfilled' ? sTrend.value : []);
        setObjectTrend(oTrend.status === 'fulfilled' ? oTrend.value : []);
        setDownloadedTrend(dTrend.status === 'fulfilled' ? dTrend.value : []);
      } catch (err) {
        console.error('Failed to load analytics data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [lastRefreshed]);

  // Sync with global search if altered from topbar
  useEffect(() => {
    if (globalSearch !== searchQuery) {
      setSearchQuery(globalSearch);
    }
  }, [globalSearch]);

  // Filtered & Sorted Records
  const filteredRecords = useMemo(() => {
    return records
      .filter((rec) => {
        if (selectedBucket !== 'ALL' && rec.bucket !== selectedBucket) return false;
        if (selectedClass !== 'ALL' && rec.storageClass !== selectedClass) return false;
        if (
          selectedActivity !== 'ALL' &&
          rec.activityLevel.toUpperCase() !== selectedActivity.toUpperCase()
        )
          return false;
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase();
          const matchBucket = rec.bucket.toLowerCase().includes(q);
          const matchPrefix = rec.prefix.toLowerCase().includes(q);
          if (!matchBucket && !matchPrefix) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        if (valA == null && valB == null) return 0;
        if (valA == null) return 1;
        if (valB == null) return -1;
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDirection === 'asc' ? valA - valB : valB - valA;
        }
        return sortDirection === 'asc'
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
  }, [
    records,
    selectedBucket,
    selectedClass,
    selectedActivity,
    searchQuery,
    sortField,
    sortDirection,
  ]);

  // Pagination slice
  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage]);

  const handleSort = (field: keyof AnalyticsPrefixRecord) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setGlobalSearch('');
    setSelectedBucket('ALL');
    setSelectedClass('ALL');
    setSelectedActivity('ALL');
    setCurrentPage(1);
    addToast('Filters Reset', 'Cleared all active analytics filters.', 'info');
  };

  const toggleSelectAll = () => {
    if (selectedRowIds.size === paginatedRecords.length) {
      setSelectedRowIds(new Set());
    } else {
      setSelectedRowIds(new Set(paginatedRecords.map((r) => r.id)));
    }
  };

  const toggleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedRowIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedRowIds(next);
  };

  const bucketOptions = buckets.map((b) => ({ label: b.name, value: b.name }));
  const classOptions = [
    { label: 'S3 Standard', value: 'STANDARD' },
    { label: 'Standard-IA', value: 'STANDARD_IA' },
    { label: 'Intelligent-Tiering', value: 'INTELLIGENT_TIERING' },
    { label: 'Glacier Flexible', value: 'GLACIER' },
  ];
  const activityOptions = [
    { label: 'High', value: 'High' },
    { label: 'Medium', value: 'Medium' },
    { label: 'Low', value: 'Low' },
    { label: 'Very Low', value: 'Very Low' },
    { label: 'Unavailable', value: 'UNAVAILABLE' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Storage Analytics"
        subtitle="Analyze storage volume, object distributions, and observed infrastructure metrics powered by AWS S3 & S3 Storage Lens."
        showDateRange={true}
        showRefresh={true}
      />

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : !kpis ? (
        <div className="aws-card p-5 text-sm text-slate-600 dark:text-slate-300">Analytics KPI data is unavailable because the backend did not return a live response. No sample values are substituted.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricCard
            title="Total Storage"
            value={
              kpis.totalStorageFormatted ||
              (kpis.totalStorageTB > 0 ? `${kpis.totalStorageTB} TB` : '0 B')
            }
            badgeLabel={
              kpis.provenance?.totalStorage === 'CALCULATED_FROM_S3'
                ? 'CALCULATED'
                : kpis.provenance?.totalStorage || 'LIVE AWS'
            }
            description="Aggregated portfolio volume"
            icon={HardDrive}
            subtext={
              kpis.monitoredBucketsFormatted ||
              `${kpis.monitoredBuckets || buckets.length} Monitored buckets`
            }
          />
          <MetricCard
            title="Object Count"
            value={kpis.totalObjectsFormatted || `${kpis.totalObjects || 0}`}
            badgeLabel={
              kpis.provenance?.totalObjects === 'LIVE_AWS'
                ? 'LIVE AWS'
                : kpis.provenance?.totalObjects || 'LIVE'
            }
            description="Stored S3 objects"
            icon={Files}
            subtext="Live AWS S3 objects"
          />
          <MetricCard
            title="GET Requests"
            value={kpis.totalGetRequestsFormatted || 'N/A'}
            badgeLabel={kpis.provenance?.totalGetRequests || 'UNAVAILABLE'}
            description="Retrieval requests"
            icon={ArrowDownCircle}
            subtext="Awaiting real Storage Lens datapoints"
          />
          <MetricCard
            title="PUT Requests"
            value={kpis.totalPutRequestsFormatted || 'N/A'}
            badgeLabel={kpis.provenance?.totalPutRequests || 'UNAVAILABLE'}
            description="Ingestion requests"
            icon={ArrowUpCircle}
            subtext="Awaiting real Storage Lens datapoints"
          />
          <MetricCard
            title="Downloaded Bytes"
            value={kpis.totalDownloadedFormatted || 'N/A'}
            badgeLabel={kpis.provenance?.totalDownloaded || 'UNAVAILABLE'}
            description="Data egress volume"
            icon={Download}
            subtext="Awaiting real Storage Lens datapoints"
          />
        </div>
      )}

      <StorageLensExportPanel />

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Dynamic Analytics Trend Chart */}
        <div className="lg:col-span-8">
          <ChartCard
            title="Storage & Activity Intelligence"
            subtitle="Genuine infrastructure observations from connected AWS account"
            action={
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.08] p-0.5 rounded-lg text-xs font-mono">
                <button
                  onClick={() => setChartTab('growth')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    chartTab === 'growth'
                      ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Storage Growth
                </button>
                <button
                  onClick={() => setChartTab('objects')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    chartTab === 'objects'
                      ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Object Count
                </button>
                <button
                  onClick={() => setChartTab('egress')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    chartTab === 'egress'
                      ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Egress
                </button>
              </div>
            }
          >
            {loading ? (
              <LoadingSkeleton rows={4} />
            ) : chartTab === 'growth' ? (
              <StorageTrendChart data={storageTrend} />
            ) : chartTab === 'objects' ? (
              objectTrend && objectTrend.length > 1 ? (
                <div className="w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={objectTrend}
                      margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#F1F5F9"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="month"
                        stroke="#94A3B8"
                        fontSize={11}
                        tickLine={false}
                      />
                      <YAxis
                        stroke="#94A3B8"
                        fontSize={11}
                        tickLine={false}
                        tickFormatter={(val) =>
                          val >= 1000 ? `${(val / 1000).toFixed(1)}K` : `${val}`
                        }
                      />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-slate-900 text-white text-xs p-2.5 rounded shadow border border-slate-700 font-mono">
                                <p className="font-semibold text-slate-200">
                                  {label}
                                </p>
                                <p className="text-amber-400 mt-1">
                                  Total Objects:{' '}
                                  {payload[0].value?.toLocaleString()}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="objects"
                        name="Objects"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        fill="#DBEAFE"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="w-full h-64 flex flex-col items-center justify-center p-6 bg-slate-900/40 rounded-xl border border-white/[0.06] text-center">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
                    <Files className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-white font-display">
                    Historical Object Trend Unavailable
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-md leading-relaxed">
                    No historical object-count series is available from the Storage Lens export yet. The current S3 inventory observation below is not presented as Storage Lens history.
                  </p>
                  <div className="mt-4 px-4 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center gap-3">
                    <span className="text-xs text-slate-300 font-sans">
                      Live Discovered Count:
                    </span>
                    <span className="font-mono text-xs font-bold text-blue-400">
                      {kpis?.totalObjectsFormatted || 'Unavailable'} objects
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                      LIVE AWS
                    </span>
                  </div>
                </div>
              )
            ) : downloadedTrend && downloadedTrend.length > 0 ? (
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={downloadedTrend}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#F1F5F9"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      stroke="#94A3B8"
                      fontSize={11}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#94A3B8"
                      fontSize={11}
                      tickLine={false}
                      tickFormatter={(val) => `${val} GB`}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-slate-900 text-white text-xs p-2.5 rounded shadow border border-slate-700 font-mono">
                              <p className="font-semibold text-slate-200">
                                {label}
                              </p>
                              <p className="text-emerald-400 mt-1">
                                Downloaded: {payload[0].value} GB
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="gb"
                      name="Downloaded GB"
                      stroke="#10B981"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#10B981' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="w-full h-64 flex flex-col items-center justify-center p-6 bg-slate-900/40 rounded-xl border border-white/[0.06] text-center">
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/[0.08] flex items-center justify-center text-slate-400 mb-3">
                  <Download className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white font-display">
                  Egress & Download Metrics Unavailable
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-md leading-relaxed">
                  No verified egress datapoints are available from the Storage Lens export or CloudWatch query yet. Values remain unavailable until AWS returns real observations.
                </p>
                <div className="mt-3 px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-mono">
                  STATUS: UNAVAILABLE
                </div>
              </div>
            )}
          </ChartCard>
        </div>

        {/* Right: Storage Tier Breakdown */}
        <div className="lg:col-span-4">
          <ChartCard
            title="Storage by Class"
            subtitle="Current direct S3 inventory · CALCULATED"
          >
            {loading ? (
              <LoadingSkeleton rows={4} />
            ) : (
              <StorageClassDonut data={storageByClass} />
            )}
          </ChartCard>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedBucket={selectedBucket}
        onBucketChange={setSelectedBucket}
        bucketOptions={bucketOptions}
        selectedClass={selectedClass}
        onClassChange={setSelectedClass}
        classOptions={classOptions}
        selectedActivity={selectedActivity}
        onActivityChange={setSelectedActivity}
        activityOptions={activityOptions}
        onReset={handleResetFilters}
        totalResultsCount={records.length}
        filteredResultsCount={filteredRecords.length}
      />

      {/* Data Table */}
      <div className="aws-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
              Discovered Prefix Segments ({filteredRecords.length})
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 font-semibold">
              LIVE AWS DISCOVERY
            </span>
            {selectedRowIds.size > 0 && (
              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-medium">
                {selectedRowIds.size} selected
              </span>
            )}
          </div>
          <span className="text-xs text-slate-500">
            Page {currentPage} of {totalPages}
          </span>
        </div>

        {loading ? (
          <LoadingSkeleton rows={6} />
        ) : paginatedRecords.length === 0 ? (
          <EmptyState
            title="No matching prefix segments found"
            description="Try clearing search filters or changing the bucket/class dropdown selections."
            action={
              <button onClick={handleResetFilters} className="btn-secondary !text-xs">
                Reset All Filters
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="aws-table-th w-8">
                    <button
                      onClick={toggleSelectAll}
                      className="text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      {selectedRowIds.size === paginatedRecords.length &&
                      paginatedRecords.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-amber-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th
                    className="aws-table-th cursor-pointer hover:text-slate-800"
                    onClick={() => handleSort('bucket')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Bucket</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    className="aws-table-th cursor-pointer hover:text-slate-800"
                    onClick={() => handleSort('prefix')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Prefix</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    className="aws-table-th cursor-pointer hover:text-slate-800"
                    onClick={() => handleSort('storageGB')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Storage</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    className="aws-table-th cursor-pointer hover:text-slate-800"
                    onClick={() => handleSort('objects')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Objects</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="aws-table-th">Storage Class</th>
                  <th className="aws-table-th">GET Requests</th>
                  <th className="aws-table-th">Downloaded</th>
                  <th className="aws-table-th">Activity Level</th>
                  <th className="aws-table-th">Data Source</th>
                  <th className="aws-table-th text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {paginatedRecords.map((record) => {
                  const isSelected = selectedRowIds.has(record.id);
                  return (
                    <tr
                      key={record.id}
                      onClick={() => setActiveRecord(record)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-amber-50/40' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td
                        className="aws-table-td"
                        onClick={(e) => toggleSelectRow(record.id, e)}
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-amber-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300 hover:text-slate-500" />
                        )}
                      </td>
                      <td className="aws-table-td font-mono font-medium text-slate-900">
                        {record.bucket}
                      </td>
                      <td className="aws-table-td font-mono text-xs text-slate-700">
                        {record.prefix}
                      </td>
                      <td className="aws-table-td font-mono font-semibold text-slate-900">
                        {record.storageFormatted}
                      </td>
                      <td className="aws-table-td font-mono text-slate-700">
                        {record.objectsFormatted}
                      </td>
                      <td className="aws-table-td">
                        <StorageClassBadge storageClass={record.storageClass} />
                      </td>
                      <td className="aws-table-td font-mono text-slate-700">
                        {record.getRequests != null ? (
                          record.getRequests.toLocaleString()
                        ) : (
                          <span className="text-slate-400 text-xs italic">N/A</span>
                        )}
                      </td>
                      <td className="aws-table-td font-mono text-slate-700">
                        {record.downloadedGB != null ? (
                          `${record.downloadedGB} GB`
                        ) : (
                          <span className="text-slate-400 text-xs italic">N/A</span>
                        )}
                      </td>
                      <td className="aws-table-td">
                        <ActivityBadge level={record.activityLevel} />
                      </td>
                      <td className="aws-table-td">
                        <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                          {record.dataSource || 'LIVE_AWS'}
                        </span>
                      </td>
                      <td className="aws-table-td text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveRecord(record);
                          }}
                          className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-amber-700 transition-colors"
                          title="Open prefix analytics drawer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        {filteredRecords.length > pageSize && (
          <div className="p-4 border-t border-slate-200/80 bg-white flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, filteredRecords.length)} of{' '}
              {filteredRecords.length} entries
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="btn-secondary !text-xs !py-1 !px-2.5 disabled:opacity-40"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="btn-secondary !text-xs !py-1 !px-2.5 disabled:opacity-40"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Analytics Drilldown Drawer */}
      <AnalyticsDetailDrawer
        record={activeRecord}
        onClose={() => setActiveRecord(null)}
      />
    </div>
  );
};
