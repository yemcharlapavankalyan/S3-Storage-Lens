import React from 'react';
import { ShieldAlert, CircleHelp } from 'lucide-react';

interface FailoverRecommendationProps { className?: string }

export const FailoverRecommendation: React.FC<FailoverRecommendationProps> = ({ className = '' }) => (
  <section className={`aws-card p-5 ${className}`} aria-label="Failover verification status">
    <div className="flex items-center gap-2">
      <ShieldAlert className="h-4 w-4 text-amber-500" />
      <h2 className="text-sm font-bold text-slate-900 dark:text-white">Failover readiness</h2>
    </div>
    <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/25 dark:bg-amber-500/10">
      <div className="flex items-start gap-2.5">
        <CircleHelp className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 dark:text-amber-300" />
        <div>
          <p className="text-xs font-semibold text-amber-950 dark:text-amber-200">Not evaluated from available AWS evidence</p>
          <p className="mt-1 text-xs leading-relaxed text-amber-900 dark:text-amber-100/80">Bucket locations and enabled replication configurations are observed separately. A standby region, recovery objective, replication lag, or failover readiness is not inferred from bucket presence.</p>
        </div>
      </div>
    </div>
    <p className="mt-3 text-[11px] text-slate-600 dark:text-slate-400">Only enabled S3 replication rules returned by AWS are drawn as replication paths. No candidate region is represented as provisioned infrastructure.</p>
  </section>
);
