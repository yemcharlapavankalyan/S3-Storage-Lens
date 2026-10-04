import React, { useEffect, useState, useMemo } from 'react';
import {
  Clock,
  AlertTriangle,
  ArrowRightLeft,
  Trash2,
  Plus,
  Search,
  Eye,
  CheckCircle,
  Database,
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { MetricCard } from '../components/common/MetricCard';
import { StatusBadge, StorageClassBadge } from '../components/common/Badges';
import { PolicyDetailDrawer } from '../components/lifecycle/PolicyDetailDrawer';
import { CreatePolicyModal } from '../components/lifecycle/CreatePolicyModal';
import { LoadingSkeleton, CardSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { LifecyclePolicy } from '../types';
import {
  getLifecycleSummary,
  getLifecyclePolicies,
  createLifecyclePolicy,
} from '../services/lifecycleService';
import { useApp } from '../context/AppContext';

export const LifecyclePage: React.FC = () => {
  const { lastRefreshed, globalSearch, addToast } = useApp();

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [policies, setPolicies] = useState<LifecyclePolicy[]>([]);
  const [searchQuery, setSearchQuery] = useState(globalSearch);
  const [selectedPolicy, setSelectedPolicy] = useState<LifecyclePolicy | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [sum, pols] = await Promise.all([
          getLifecycleSummary(),
          getLifecyclePolicies(),
        ]);
        setSummary(sum);
        setPolicies(pols);
      } catch (err) {
        console.error('Failed to load lifecycle policies:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [lastRefreshed]);

  const handleCreatePolicy = async (formData: any) => {
    try {
      const created = await createLifecyclePolicy(formData);
      // Refresh configuration from backend
      const [sum, pols] = await Promise.all([
        getLifecycleSummary(),
        getLifecyclePolicies(),
      ]);
      setSummary(sum);
      setPolicies(pols);
      addToast(
        'Lifecycle Policy Applied',
        `Successfully applied rule "${created.policyName}" to bucket "${created.bucket}".`,
        'success'
      );
    } catch (err: any) {
      addToast('Creation Failed', err.message || 'Could not apply policy.', 'error');
    }
  };

  const filteredPolicies = useMemo(() => {
    return policies.filter((p) => {
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          p.policyName.toLowerCase().includes(q) ||
          p.bucket.toLowerCase().includes(q) ||
          p.prefix.toLowerCase().includes(q) ||
          p.targetClass.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [policies, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header with Create Policy action */}
      <PageHeader
        title="Lifecycle Policies"
        subtitle="View and monitor automated S3 object lifecycle strategies, transition rules, and expiration schedules."
        showDateRange={false}
        showRefresh={true}
        actions={
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-primary !text-xs !py-1.5 !px-3"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Create Policy
          </button>
        }
      />

      {/* Summary Cards */}
      {loading || !summary ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Active Policies"
            value={summary.activePolicies}
            description="Operational lifecycle automations"
            icon={Clock}
            subtext="Automated daily evaluation"
          />
          <MetricCard
            title="Pending Review"
            value={summary.pendingReview}
            description="Policies flagged for adjustment"
            icon={AlertTriangle}
            changeType="negative"
            badgeLabel="Review"
          />
          <MetricCard
            title="Transitions"
            value={summary.transitions}
            description="Active tier migration rules"
            icon={ArrowRightLeft}
            subtext="Standard -> IA / Glacier"
          />
          <MetricCard
            title="Expiration Rules"
            value={summary.expirationRules}
            description="Permanent object purge schedules"
            icon={Trash2}
            subtext="Transients & log retention"
          />
        </div>
      )}

      {/* Search & Actions Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search policy name, bucket, prefix..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-md outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div className="text-xs text-slate-500">
          Showing <strong>{filteredPolicies.length}</strong> of{' '}
          <strong>{policies.length}</strong> configured policies
        </div>
      </div>

      {/* Main Table */}
      <div className="aws-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
            Lifecycle Policy Catalog
          </span>
          <span className="text-xs text-slate-500 font-mono">
            Daily Evaluation Window: 00:00 UTC
          </span>
        </div>

        {loading ? (
          <LoadingSkeleton rows={6} />
        ) : policies.length === 0 ? (
          <EmptyState
            title="No lifecycle configuration"
            description="The lifecycle API returned no configured policies for the current view. Check bucket configuration details or refresh the AWS-backed inventory before creating a rule."
            action={
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="btn-primary !text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Configure S3 Lifecycle Rule
              </button>
            }
          />
        ) : filteredPolicies.length === 0 ? (
          <EmptyState
            title="No matching lifecycle policies"
            description="Try adjusting your search criteria."
            action={
              <button
                onClick={() => setSearchQuery('')}
                className="btn-secondary !text-xs"
              >
                Clear Search
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="aws-table-th">Policy Name</th>
                  <th className="aws-table-th">Bucket</th>
                  <th className="aws-table-th">Prefix Filter</th>
                  <th className="aws-table-th">Current Class</th>
                  <th className="aws-table-th">Transition</th>
                  <th className="aws-table-th">Expiration</th>
                  <th className="aws-table-th">Status</th>
                  <th className="aws-table-th text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredPolicies.map((policy) => (
                  <tr
                    key={policy.id}
                    onClick={() => setSelectedPolicy(policy)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="aws-table-td">
                      <div>
                        <span className="font-semibold text-xs text-slate-900 block">
                          {policy.policyName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Updated {policy.lastUpdated}
                        </span>
                      </div>
                    </td>
                    <td className="aws-table-td font-mono font-medium text-slate-800">
                      {policy.bucket}
                    </td>
                    <td className="aws-table-td font-mono text-xs text-slate-700">
                      {policy.prefix}
                    </td>
                    <td className="aws-table-td">
                      <StorageClassBadge storageClass={policy.currentClass} />
                    </td>
                    <td className="aws-table-td">
                      {policy.targetClass === 'EXPIRATION' ? (
                        <span className="text-slate-400 font-mono text-xs">-</span>
                      ) : (
                        <div>
                          <StorageClassBadge storageClass={policy.targetClass} />
                          {policy.transitionDays && (
                            <span className="block text-[10px] text-slate-500 font-mono mt-0.5">
                              after {policy.transitionDays} days
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="aws-table-td font-mono text-xs text-slate-700">
                      {policy.expirationDays ? `${policy.expirationDays} days` : '-'}
                    </td>
                    <td className="aws-table-td">
                      <StatusBadge status={policy.status} />
                    </td>
                    <td className="aws-table-td text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPolicy(policy);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded transition-colors"
                        title="View policy lifecycle timeline"
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

      {/* Policy Detail Drawer with Timeline */}
      <PolicyDetailDrawer
        policy={selectedPolicy}
        onClose={() => setSelectedPolicy(null)}
      />

      {/* Create Policy Modal */}
      <CreatePolicyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreatePolicy}
      />
    </div>
  );
};
