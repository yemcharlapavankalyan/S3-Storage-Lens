import React, { useEffect, useState, useMemo } from 'react';
import {
  Database,
  HardDrive,
  Files,
  TrendingUp,
  Search,
  Eye,
  ExternalLink,
  Shield,
  Layers,
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { MetricCard } from '../components/common/MetricCard';
import { StatusBadge, ActivityBadge, StorageClassBadge } from '../components/common/Badges';
import { BucketDetailDrawer } from '../components/buckets/BucketDetailDrawer';
import { LoadingSkeleton, CardSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { Bucket } from '../types';
import { getBuckets } from '../services/bucketService';
import { useApp } from '../context/AppContext';
import { formatBytes } from '../utils/formatters';

export const BucketsPage: React.FC = () => {
  const { lastRefreshed, globalSearch } = useApp();

  const [loading, setLoading] = useState(true);
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [searchQuery, setSearchQuery] = useState(globalSearch);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'region' | 'storage' | 'objects'>('name');
  const [selectedBucket, setSelectedBucket] = useState<Bucket | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await getBuckets();
        setBuckets(data);
      } catch (err) {
        console.error('Failed to load buckets:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [lastRefreshed]);

  const filteredBuckets = useMemo(() => {
    return buckets.filter((b) => {
      if (selectedStatus !== 'ALL' && b.status !== selectedStatus) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          b.name.toLowerCase().includes(q) ||
          b.region.toLowerCase().includes(q) ||
          b.primaryStorageClass.toLowerCase().includes(q)
        );
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'region') return a.region.localeCompare(b.region);
      if (sortBy === 'objects') return b.objects - a.objects;
      if (sortBy === 'storage') return b.storageGB - a.storageGB;
      return a.name.localeCompare(b.name);
    });
  }, [buckets, selectedStatus, searchQuery, sortBy]);

  const totalStorageBytes = useMemo(() => {
    return buckets.reduce((acc, b) => acc + ((b as any).storageBytes || (b.storageTB ? b.storageTB * 1024 * 1024 * 1024 * 1024 : 0)), 0);
  }, [buckets]);
  const totalObjectsCount = useMemo(() => {
    return buckets.reduce((acc, b) => acc + b.objects, 0);
  }, [buckets]);
  const largestBucket = useMemo(() => {
    if (buckets.length === 0) return null;
    return [...buckets].sort((a, b) => (((b as any).storageBytes || 0) - ((a as any).storageBytes || 0)))[0];
  }, [buckets]);
  const uniqueRegions = useMemo(() => {
    return Array.from(new Set(buckets.map((b) => b.region).filter(Boolean))).join(', ') || 'Unavailable';
  }, [buckets]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Buckets"
        subtitle="Overview of monitored Amazon S3 buckets, configuration metadata, and storage tiers."
        showDateRange={false}
        showRefresh={true}
      />

      {/* Top 4 KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Buckets"
            value={buckets.length}
            description="Active monitored S3 buckets"
            icon={Database}
            subtext={uniqueRegions}
          />
          <MetricCard
            title="Total Storage"
            value={formatBytes(totalStorageBytes)}
            description="Accumulated data volume"
            icon={HardDrive}
            subtext="Across all storage tiers"
            badgeLabel="LIVE AWS"
          />
          <MetricCard
            title="Total Objects"
            value={totalObjectsCount.toLocaleString()}
            description="Aggregated object index"
            icon={Files}
            subtext={`${totalObjectsCount} items discovered`}
          />
          <MetricCard
            title="Largest Bucket"
            value={largestBucket ? largestBucket.name : 'None'}
            description={largestBucket ? `${(largestBucket as any).storageFormatted || formatBytes((largestBucket as any).storageBytes)} (${largestBucket.objectsFormatted} items)` : '0 B'}
            icon={Layers}
            badgeLabel="LIVE AWS"
            subtext={largestBucket && totalStorageBytes > 0 ? `${(((largestBucket as any).storageBytes || 0) / totalStorageBytes * 100).toFixed(1)}% of total storage` : 'No storage recorded'}
          />
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3.5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bucket name, region..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 dark:text-slate-100 hover:bg-white dark:hover:bg-slate-700 focus:bg-white dark:focus:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 whitespace-nowrap">Filter Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-100 py-1.5 px-3 rounded-md outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="Healthy">Healthy</option>
            <option value="Optimization Candidate">Optimization Candidate</option>
            <option value="Review">Review</option>
          </select>
        </div>

        <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
          Sort by
          <select aria-label="Sort buckets" value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} className="text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-100 py-1.5 px-3 rounded-md">
            <option value="name">Bucket name</option><option value="region">Region</option><option value="storage">Storage size</option><option value="objects">Object count</option>
          </select>
        </label>
      </div>

      {/* Buckets Table */}
      <div className="aws-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200/80 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
            Monitored Bucket Catalog ({filteredBuckets.length})
          </span>
          <span className="text-xs text-slate-500 font-mono">
            LIVE AWS S3 inventory
          </span>
        </div>

        {loading ? (
          <LoadingSkeleton rows={8} />
        ) : filteredBuckets.length === 0 ? (
          <EmptyState
            title="No buckets match your criteria"
            description="Clear the search or change the status filter."
            action={
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedStatus('ALL');
                }}
                className="btn-secondary !text-xs"
              >
                Reset Filters
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="aws-table-th">Bucket Name</th>
                  <th className="aws-table-th">Region</th>
                  <th className="aws-table-th">Storage</th>
                  <th className="aws-table-th">Objects</th>
                  <th className="aws-table-th">Primary Class</th>
                  <th className="aws-table-th">Activity</th>
                  <th className="aws-table-th">Last Updated</th>
                  <th className="aws-table-th">Status</th>
                  <th className="aws-table-th text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-900">
                {filteredBuckets.map((bucket) => (
                  <tr
                    key={bucket.id}
                    onClick={() => setSelectedBucket(bucket)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="aws-table-td">
                      <div className="flex items-center gap-2.5">
                        <Database className="w-4 h-4 text-amber-600 shrink-0" />
                        <div>
                            <span className="font-mono text-xs font-semibold text-slate-900 dark:text-slate-100 block">
                            {bucket.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {bucket.lifecycleRulesCount} lifecycle rules
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="aws-table-td font-mono text-xs text-slate-600 dark:text-slate-300">
                      {bucket.region}
                    </td>
                    <td className="aws-table-td font-mono font-semibold text-slate-900 dark:text-slate-100">
                      {(bucket as any).storageFormatted || formatBytes((bucket as any).storageBytes || (bucket.storageTB ? bucket.storageTB * 1024 * 1024 * 1024 * 1024 : 0))}
                    </td>
                    <td className="aws-table-td font-mono text-slate-700 dark:text-slate-300">
                      {bucket.objectsFormatted || `${bucket.objects}`}
                    </td>
                    <td className="aws-table-td">
                      <StorageClassBadge storageClass={bucket.primaryStorageClass} />
                    </td>
                    <td className="aws-table-td">
                      <ActivityBadge level={bucket.activityLevel} />
                    </td>
                    <td className="aws-table-td font-mono text-xs text-slate-500">
                      {bucket.lastUpdated}
                    </td>
                    <td className="aws-table-td">
                      <StatusBadge status={bucket.status} />
                    </td>
                    <td className="aws-table-td text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBucket(bucket);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded transition-colors"
                        title="View bucket details"
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
        )}
      </div>

      {/* Bucket Detail Drawer */}
      <BucketDetailDrawer
        bucket={selectedBucket}
        onClose={() => setSelectedBucket(null)}
      />
    </div>
  );
};
