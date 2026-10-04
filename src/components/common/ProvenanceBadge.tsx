import React from 'react';

export type Provenance = 'LIVE AWS' | 'STORAGE LENS' | 'CALCULATED' | 'ESTIMATED' | 'UNAVAILABLE' | 'MOCK FALLBACK';
const styles: Record<Provenance, string> = {
  'LIVE AWS': 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
  'STORAGE LENS': 'border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300',
  CALCULATED: 'border-cyan-300 bg-cyan-50 text-cyan-800 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-300',
  ESTIMATED: 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
  UNAVAILABLE: 'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300',
  'MOCK FALLBACK': 'border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300',
};

export const ProvenanceBadge: React.FC<{ value: Provenance; className?: string }> = ({ value, className = '' }) => (
  <span className={`inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${styles[value]} ${className}`}>{value}</span>
);
