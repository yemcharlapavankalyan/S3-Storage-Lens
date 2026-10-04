import React from 'react';
import { ActivityLevel, PriorityLevel, CandidateStatus, BucketStatus, PolicyStatus } from '../../types';

interface StatusBadgeProps {
  status: BucketStatus | PolicyStatus | CandidateStatus | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let style = 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-500/10 dark:text-slate-300 dark:border-slate-500/20';
  let dot = 'bg-slate-400';

  const s = status.toUpperCase();

  if (s === 'HEALTHY' || s === 'ACTIVE' || s === 'APPROVED') {
    style = 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/25';
    dot = 'bg-emerald-400 shadow-sm shadow-emerald-400/50';
  } else if (s === 'OPTIMIZATION CANDIDATE' || s === 'REVIEW' || s === 'PENDING') {
    style = 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/25';
    dot = 'bg-amber-400 shadow-sm shadow-amber-400/50';
  } else if (s === 'REJECTED' || s === 'CRITICAL' || s === 'HIGH') {
    style = 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/25';
    dot = 'bg-rose-400 shadow-sm shadow-rose-400/50';
  } else if (s === 'DRAFT') {
    style = 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-500/15 dark:text-slate-400 dark:border-slate-500/20';
    dot = 'bg-slate-500';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border backdrop-blur-xs ${style}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {status}
    </span>
  );
};

interface ActivityBadgeProps {
  level: ActivityLevel | string;
}

export const ActivityBadge: React.FC<ActivityBadgeProps> = ({ level }) => {
  const l = level.toUpperCase();
  let style = 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-500/10 dark:text-slate-300 dark:border-slate-500/20';

  if (l === 'HIGH') {
    style = 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30';
  } else if (l === 'MEDIUM' || l === 'CHANGING') {
    style = 'bg-violet-50 text-violet-800 border-violet-200 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/30';
  } else if (l === 'LOW') {
    style = 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30';
  } else if (l === 'VERY_LOW' || l === 'VERY LOW') {
    style = 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30';
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${style}`}>
      {level.replace('_', ' ')}
    </span>
  );
};

interface PriorityBadgeProps {
  priority: PriorityLevel | string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const p = priority.toUpperCase();
  let style = 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-500/10 dark:text-slate-300 dark:border-slate-500/20';

  if (p === 'HIGH') {
    style = 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30 dark:shadow-xs dark:shadow-rose-500/10';
  } else if (p === 'MEDIUM') {
    style = 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30 dark:shadow-xs dark:shadow-amber-500/10';
  } else if (p === 'LOW') {
    style = 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-500/15 dark:text-slate-400 dark:border-slate-500/20';
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${style}`}>
      {priority}
    </span>
  );
};

interface StorageClassBadgeProps {
  storageClass: string;
}

export const StorageClassBadge: React.FC<StorageClassBadgeProps> = ({ storageClass }) => {
  const c = storageClass.toUpperCase().replace('-', '_');
  let label = storageClass;
  let style = 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30';

  if (c.includes('IA')) {
    label = 'Standard-IA';
    style = 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30';
  } else if (c.includes('INTELLIGENT')) {
    label = 'Intelligent-Tiering';
    style = 'bg-violet-50 text-violet-800 border-violet-200 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/30';
  } else if (c.includes('DEEP')) {
    label = 'Deep Archive';
    style = 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-500/20 dark:text-slate-300 dark:border-slate-500/30';
  } else if (c.includes('GLACIER')) {
    label = 'Glacier';
    style = 'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/30';
  } else if (c.includes('EXPIRATION')) {
    label = 'Expiration Rule';
    style = 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30';
  } else {
    label = 'S3 Standard';
    style = 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30';
  }

  return (
    <span className={`inline-flex items-center font-mono text-[11px] px-2 py-0.5 rounded border ${style}`}>
      {label}
    </span>
  );
};
