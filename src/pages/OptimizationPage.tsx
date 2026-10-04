import React, { useEffect, useState, useMemo } from 'react';
import {
  Sparkles,
  AlertTriangle,
  HardDrive,
  DollarSign,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  ArrowUpDown,
  RotateCcw,
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { MetricCard } from '../components/common/MetricCard';
import { PriorityBadge, ActivityBadge, StorageClassBadge, StatusBadge } from '../components/common/Badges';
import { OptimizationInsightsCard } from '../components/optimization/OptimizationInsightsCard';
import { OptimizationReviewModal } from '../components/optimization/OptimizationReviewModal';
import { LoadingSkeleton, CardSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { OptimizationCandidate, CandidateStatus } from '../types';
import {
  getOptimizationCandidates,
  updateCandidateStatus,
} from '../services/optimizationService';
import { useApp } from '../context/AppContext';
import { formatBytes } from '../utils/formatters';

export const OptimizationPage: React.FC = () => {
  const { lastRefreshed, globalSearch, addToast } = useApp();

  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState<OptimizationCandidate[]>([]);
  const [activeCandidate, setActiveCandidate] = useState<OptimizationCandidate | null>(null);

  // Filters
  const [tabFilter, setTabFilter] = useState<'ALL' | 'HIGH' | 'REVIEW' | 'APPROVED' | 'REJECTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState(globalSearch);
  const [selectedBucket, setSelectedBucket] = useState('ALL');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await getOptimizationCandidates();
        setCandidates(data);
      } catch (err) {
        console.error('Failed to load optimization candidates:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [lastRefreshed]);

  const handleStatusChange = async (id: string, newStatus: CandidateStatus) => {
    try {
      const res = await updateCandidateStatus(id, newStatus);
      if (res.success) {
        setCandidates((prev) =>
          prev.map((c) => (c.id === id ? res.candidate : c))
        );
        addToast(
          newStatus === 'APPROVED' ? 'Recommendation Approved' : 'Candidate Rejected',
          `Updated status for ${res.candidate.prefix} to ${newStatus}.`,
          newStatus === 'APPROVED' ? 'success' : 'warning'
        );
      }
    } catch (err) {
      addToast('Update Failed', 'Could not update candidate state.', 'error');
    }
  };

  const filteredCandidates = useMemo(() => {
    return candidates.filter((item) => {
      // Tab filter
      if (tabFilter === 'HIGH' && item.priority !== 'HIGH') return false;
      if (tabFilter === 'REVIEW' && item.status !== 'REVIEW') return false;
      if (tabFilter === 'APPROVED' && item.status !== 'APPROVED') return false;
      if (tabFilter === 'REJECTED' && item.status !== 'REJECTED') return false;

      // Bucket filter
      if (selectedBucket !== 'ALL' && item.bucket !== selectedBucket) return false;

      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          item.prefix.toLowerCase().includes(q) ||
          item.bucket.toLowerCase().includes(q) ||
          item.reason.toLowerCase().includes(q) ||
          item.recommendation.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [candidates, tabFilter, selectedBucket, searchQuery]);

  const highPriorityCount = candidates.filter((c) => c.priority === 'HIGH').length;
  const approvedCount = candidates.filter((c) => c.status === 'APPROVED').length;
  const reviewCount = candidates.filter((c) => c.status === 'REVIEW').length;

  const totalStorageBytesToReview = useMemo(() => {
    return candidates.reduce((acc, c) => acc + (c.storageBytes || (c.storageGB ? Math.round(c.storageGB * 1024 * 1024 * 1024) : 0)), 0);
  }, [candidates]);

  const totalEstimatedMonthlyDiff = useMemo(() => {
    return candidates.reduce((acc, c) => acc + (c.estimatedMonthlyDifference || 0), 0);
  }, [candidates]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Optimization Center"
        subtitle="Review inventory-based storage opportunities. Activity-based recommendations require authoritative AWS observations."
        showDateRange={false}
        showRefresh={true}
      />

      {/* Top Cards with clearly labeled estimated values */}
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
            title="Optimization Candidates"
            value={candidates.length}
            description="Identified storage segments"
            icon={Sparkles}
            subtext={`Across ${new Set(candidates.map((c) => c.bucket)).size || 2} monitored buckets`}
          />
          <MetricCard
            title="High Priority"
            value={highPriorityCount}
            description="Significant volume or missing policies"
            icon={AlertTriangle}
            changeType="negative"
            badgeLabel="Actionable"
          />
          <MetricCard
            title="Potential Storage to Review"
            value={formatBytes(totalStorageBytesToReview)}
            description="Discovered volume eligible for tiering"
            icon={HardDrive}
            subtext="Calculated from actual S3 objects"
            badgeLabel="CALCULATED"
          />
          <MetricCard
            title="Estimated Monthly Difference"
            value={totalEstimatedMonthlyDiff > 0.01 ? `$${totalEstimatedMonthlyDiff.toFixed(2)}/mo` : (totalEstimatedMonthlyDiff > 0 ? '< $0.01/mo' : '$0.00/mo')}
            description="Estimated cost difference"
            icon={DollarSign}
            changeType="positive"
            badgeLabel="ESTIMATED"
            subtext="ESTIMATED FROM S3 STORAGE VOLUME"
          />
        </div>
      )}

      {/* AI / Heuristic Smart Insight Section */}
      <OptimizationInsightsCard
        candidates={candidates}
        onFilterLowActivity={() => {
          setTabFilter('HIGH');
          addToast('Filter Applied', 'Showing high-priority candidates with significant storage impact.', 'info');
        }}
      />

      {/* Filters and Navigation Tabs */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md overflow-x-auto text-xs">
            <button
              onClick={() => setTabFilter('ALL')}
              className={`px-3 py-1.5 rounded font-medium transition-colors ${
                tabFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({candidates.length})
            </button>
            <button
              onClick={() => setTabFilter('HIGH')}
              className={`px-3 py-1.5 rounded font-medium transition-colors ${
                tabFilter === 'HIGH'
                  ? 'bg-white text-rose-700 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              High Priority ({highPriorityCount})
            </button>
            <button
              onClick={() => setTabFilter('REVIEW')}
              className={`px-3 py-1.5 rounded font-medium transition-colors ${
                tabFilter === 'REVIEW'
                  ? 'bg-white text-amber-700 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pending Review ({reviewCount})
            </button>
            <button
              onClick={() => setTabFilter('APPROVED')}
              className={`px-3 py-1.5 rounded font-medium transition-colors ${
                tabFilter === 'APPROVED'
                  ? 'bg-white text-emerald-700 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Approved ({approvedCount})
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search candidate prefix, reason..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-md outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Main Candidates Table */}
      <div className="aws-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
              Optimization Candidates ({filteredCandidates.length})
            </span>
          </div>
          <span className="text-[11px] text-slate-500">
            Click <strong>Review</strong> to inspect rationale and simulation actions
          </span>
        </div>

        {loading ? (
          <LoadingSkeleton rows={8} />
        ) : filteredCandidates.length === 0 ? (
          <EmptyState
            title="No optimization candidates found"
            description="Try changing the tab filter or clearing the search box."
            action={
              <button
                onClick={() => {
                  setTabFilter('ALL');
                  setSearchQuery('');
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
                  <th className="aws-table-th">Candidate (Bucket / Prefix)</th>
                  <th className="aws-table-th">Observed Size</th>
                  <th className="aws-table-th">Current Class</th>
                  <th className="aws-table-th">Recommendation</th>
                  <th className="aws-table-th">Evidence Used</th>
                  <th className="aws-table-th">Estimated Savings</th>
                  <th className="aws-table-th">Priority</th>
                  <th className="aws-table-th">Status</th>
                  <th className="aws-table-th text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredCandidates.map((candidate) => (
                  <tr
                    key={candidate.id}
                    onClick={() => setActiveCandidate(candidate)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="aws-table-td">
                      <div>
                        <span className="font-mono text-xs font-semibold text-slate-900 block">
                          {candidate.prefix}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {candidate.bucket}
                        </span>
                      </div>
                    </td>
                    <td className="aws-table-td font-mono font-semibold text-slate-900">
                      {candidate.storageFormatted}
                    </td>
                    <td className="aws-table-td">
                      <StorageClassBadge storageClass={candidate.currentStorageClass} />
                    </td>
                    <td className="aws-table-td">
                      <span className="text-xs font-medium text-slate-800 block">
                        {candidate.recommendation}
                      </span>
                    </td>
                    <td className="aws-table-td text-xs text-slate-600 max-w-xs">
                      <span className="line-clamp-2" title={candidate.evidenceUsed || candidate.reason}>
                        {candidate.evidenceUsed || candidate.reason}
                      </span>
                    </td>
                    <td className="aws-table-td">
                      <span className="block text-xs font-semibold text-emerald-700 font-mono">
                        {candidate.savingsFormatted || (candidate.estimatedMonthlyDifference > 0 ? `$${candidate.estimatedMonthlyDifference.toFixed(4)}/mo` : 'Hygiene rule')}
                      </span>
                      <span className="text-[9px] font-mono text-slate-400 uppercase tracking-tight block">
                        {candidate.isCalculated ? 'Calculated volume estimate' : 'Policy estimate'}
                      </span>
                    </td>
                    <td className="aws-table-td">
                      <PriorityBadge priority={candidate.priority} />
                    </td>
                    <td className="aws-table-td">
                      <StatusBadge status={candidate.status} />
                    </td>
                    <td className="aws-table-td text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveCandidate(candidate);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded shadow-2xs hover:border-amber-500 hover:text-amber-700 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Review</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal / Drawer */}
      <OptimizationReviewModal
        candidate={activeCandidate}
        onClose={() => setActiveCandidate(null)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};
