import React, { useEffect, useState } from 'react';
import { Database, Info, RefreshCw } from 'lucide-react';
import { getStorageLensExportMetrics, StorageLensExportMetrics } from '../../services/storageLensExportService';
import { useApp } from '../../context/AppContext';

const formatMetric = (value: number) => new Intl.NumberFormat().format(value);

const formatExportValue = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === '') return 'Unavailable';
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? formatMetric(numericValue) : 'Unavailable';
};

const sumMetric = (rows: StorageLensExportMetrics['account'], name: string) => {
  const matchingRows = rows.filter((row) => row.metric_name === name && row.metric_value !== '');
  if (!matchingRows.length) return null;
  return matchingRows.reduce((total, row) => {
    const value = Number(row.metric_value);
    return total + (Number.isFinite(value) ? value : 0);
  }, 0);
};

export const StorageLensExportPanel: React.FC = () => {
  const { lastRefreshed } = useApp();
  const [data, setData] = useState<StorageLensExportMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getStorageLensExportMetrics()
      .then((result) => {
        if (active) {
          setData(result);
          setError(null);
        }
      })
      .catch((requestError: Error) => {
        if (active) {
          setData(null);
          setError(requestError.message);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [lastRefreshed]);

  const status = data?.status || 'UNAVAILABLE';
  const isAvailable = status === 'AVAILABLE';
  const accountRows = data?.account || [];
  const prefixes = data?.prefixes || [];
  const storageBytes = sumMetric(accountRows, 'StorageBytes');
  const objectCount = sumMetric(accountRows, 'ObjectCount');
  const allRequests = sumMetric(accountRows, 'AllRequests');

  return (
    <section className="aws-card p-5" aria-labelledby="storage-lens-export-heading">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-amber-500" />
            <h2 id="storage-lens-export-heading" className="text-sm font-semibold text-slate-900 dark:text-white">Storage Lens export metrics</h2>
            <span className="rounded border border-blue-200 bg-blue-50 px-2 py-0.5 font-mono text-[10px] font-semibold text-blue-800 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-200">STORAGE LENS</span>
          </div>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Only metrics read from AWS Storage Lens CSV exports appear here. Direct S3 inventory is shown separately as LIVE AWS or CALCULATED.</p>
        </div>
        <span className={`rounded px-2 py-1 font-mono text-[10px] font-semibold ${isAvailable ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-300' : 'bg-amber-50 text-amber-800 dark:bg-amber-400/10 dark:text-amber-200'}`}>
          {loading ? 'CHECKING' : status.replaceAll('_', ' ')}
        </span>
      </div>

      {loading ? (
        <p className="mt-4 text-sm text-slate-500">Checking the configured AWS export destination…</p>
      ) : error ? (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200">
          <Info className="mt-0.5 h-4 w-4 shrink-0" /><span>Storage Lens export status unavailable: {error}</span>
        </div>
      ) : !isAvailable || !data ? (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100">
          <p className="font-semibold">{status === 'CONFIGURED_BUT_WAITING_FOR_FIRST_EXPORT' ? 'Configured; waiting for AWS’s first export' : status === 'NOT_CONFIGURED' ? 'No export destination is configured' : 'Storage Lens data is unavailable'}</p>
          <p className="mt-1 text-xs leading-relaxed">{data?.reason || 'No Storage Lens export data was returned. No S3 inventory or sample metrics are substituted.'}</p>
          {data?.destination && <p className="mt-2 font-mono text-[11px]">Destination: s3://{data.destination.bucket}/{data.destination.prefix}/ · {data.destination.format} · Dashboard {data.dashboardId}</p>}
        </div>
      ) : (
        <>
          <p className="mt-3 text-xs text-slate-500">Latest AWS report date: <strong className="text-slate-800 dark:text-slate-200">{data.latestSnapshotDate || 'Not specified by manifest'}</strong> · Dashboard: {data.dashboardId}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ['StorageBytes', storageBytes, 'bytes'],
              ['ObjectCount', objectCount, 'objects'],
              ['AllRequests', allRequests, 'requests'],
              ['GetRequests', sumMetric(accountRows, 'GetRequests'), 'requests'],
              ['PutRequests', sumMetric(accountRows, 'PutRequests'), 'requests'],
              ['BytesDownloaded', sumMetric(accountRows, 'BytesDownloaded'), 'bytes'],
            ].map(([label, value, unit]) => (
              <div key={String(label)} className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-slate-900/50">
                <p className="font-mono text-[10px] uppercase tracking-wide text-slate-500">{label}</p>
                <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{formatExportValue(value as number | null)}</p>
                <p className="text-[10px] text-slate-500">{unit} · aggregated from account rows</p>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Prefix rows from the latest export ({prefixes.length})</h3>
            {prefixes.length ? (
              <div className="max-h-56 overflow-auto rounded-lg border border-slate-200 dark:border-white/10">
                {prefixes.slice(0, 40).map((row, index) => (
                  <div key={`${row.bucket_name}-${row.aws_region}-${row.storage_class}-${row.metric_name}-${row.decodedPrefix}-${index}`} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 border-b border-slate-100 px-3 py-2 text-xs last:border-0 dark:border-white/5">
                    <span className="min-w-0 truncate text-slate-700 dark:text-slate-300">{row.bucket_name || 'Account'} / {row.decodedPrefix || row.record_value || '(root)'} <span className="text-slate-400">· {row.metric_name}</span></span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">{formatExportValue(row.metric_value)}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-xs text-slate-500">The latest export contains no PREFIX records.</p>}
          </div>
        </>
      )}
      {data?.destination && <div className="mt-3 flex items-center gap-1 text-[10px] text-slate-500"><RefreshCw className="h-3 w-3" />Checked {data.checkedAt ? new Date(data.checkedAt).toLocaleString() : 'just now'} · s3://{data.destination.bucket}/{data.destination.prefix}/</div>}
    </section>
  );
};
