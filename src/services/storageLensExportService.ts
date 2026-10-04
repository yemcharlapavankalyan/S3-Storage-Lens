import { apiClient } from './api';

export interface StorageLensExportStatus {
  status: 'AVAILABLE' | 'CONFIGURED_BUT_WAITING_FOR_FIRST_EXPORT' | 'NOT_CONFIGURED' | 'UNAVAILABLE';
  provenance: 'STORAGE_LENS' | 'UNAVAILABLE';
  reason: string | null;
  dashboardId: string | null;
  accountId: string | null;
  destination: { bucket: string; prefix: string; format: string | null; schemaVersion: string | null } | null;
  latestSnapshotDate: string | null;
  checkedAt?: string;
}

export interface StorageLensExportMetric {
  configuration_id: string;
  report_date: string;
  aws_region: string;
  storage_class: string;
  record_type: string;
  record_value: string;
  bucket_name: string;
  metric_name: string;
  metric_value: number | string;
  decodedPrefix?: string;
}

export interface StorageLensExportMetrics extends StorageLensExportStatus {
  metrics: StorageLensExportMetric[];
  account: StorageLensExportMetric[];
  buckets: StorageLensExportMetric[];
  prefixes: StorageLensExportMetric[];
}

export function getStorageLensExportStatus() {
  return apiClient<StorageLensExportStatus>('/storage-lens/export/status');
}

export function getStorageLensExportMetrics() {
  return apiClient<StorageLensExportMetrics>('/storage-lens/export/metrics');
}
