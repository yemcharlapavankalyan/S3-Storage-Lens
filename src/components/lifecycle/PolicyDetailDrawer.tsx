import React from 'react';
import { DetailDrawer } from '../common/DetailDrawer';
import { LifecyclePolicy } from '../../types';
import { StatusBadge, StorageClassBadge } from '../common/Badges';
import { LifecycleTimeline } from './LifecycleTimeline';
import { Clock, Database, Folder, Shield, Calendar, DollarSign } from 'lucide-react';

interface PolicyDetailDrawerProps {
  policy: LifecyclePolicy | null;
  onClose: () => void;
}

export const PolicyDetailDrawer: React.FC<PolicyDetailDrawerProps> = ({
  policy,
  onClose,
}) => {
  if (!policy) return null;

  return (
    <DetailDrawer
      isOpen={!!policy}
      onClose={onClose}
      title={policy.policyName}
      subtitle={`Target: ${policy.bucket}${policy.prefix}`}
      width="max-w-xl"
      badge={<StatusBadge status={policy.status} />}
    >
      <div className="space-y-6 text-xs">
        {/* Policy Metadata Card */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] uppercase font-semibold text-slate-500 block">
              Target Bucket
            </span>
            <span className="text-sm font-bold font-mono text-slate-900 mt-1 block">
              {policy.bucket}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] uppercase font-semibold text-slate-500 block">
              Prefix Filter
            </span>
            <span className="text-sm font-bold font-mono text-slate-900 mt-1 block">
              {policy.prefix}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] uppercase font-semibold text-slate-500 block">
              Impacted Objects
            </span>
            <span className="text-sm font-bold font-mono text-slate-900 mt-1 block">
              {policy.objectsImpacted.toLocaleString()} objects
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] uppercase font-semibold text-slate-500 block">
              Est. Monthly Impact
            </span>
            <span className="text-sm font-bold font-mono text-emerald-600 mt-1 block">
              {policy.estimatedSavings}
            </span>
          </div>
        </div>

        {/* Visual Lifecycle Progression Timeline */}
        <div className="aws-card p-4">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
            <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
              Automated Lifecycle Timeline
            </h4>
            <span className="text-[10px] font-mono text-slate-400">
              Days from Object Creation
            </span>
          </div>

          <LifecycleTimeline stages={policy.stages} />
        </div>

        {/* Timing conditions summary */}
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
          <h4 className="font-semibold text-slate-800 uppercase text-[10px] tracking-wider">
            Rule Execution Parameters
          </h4>
          <div className="space-y-1.5 text-slate-600">
            <div className="flex justify-between">
              <span>Transition Tier:</span>
              <span className="font-mono text-slate-900">{policy.targetClass}</span>
            </div>
            <div className="flex justify-between">
              <span>Transition Timing:</span>
              <span className="font-mono text-slate-900">
                {policy.transitionDays ? `${policy.transitionDays} days` : 'None configured'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Expiration Timing:</span>
              <span className="font-mono text-slate-900">
                {policy.expirationDays ? `${policy.expirationDays} days` : 'Never expires'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Last Evaluated:</span>
              <span className="font-mono text-slate-900">{policy.lastUpdated}</span>
            </div>
          </div>
        </div>
      </div>
    </DetailDrawer>
  );
};
