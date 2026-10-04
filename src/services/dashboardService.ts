import {
  StorageSummary,
  StorageByClassItem,
  StorageTrendPoint,
  ActivityMetricPoint,
  SystemEvent,
} from '../types';
import { apiClient } from './api';

export async function getDashboardSummary(): Promise<StorageSummary> {
  return apiClient<StorageSummary>('/dashboard/summary');
}

export async function getStorageByClass(): Promise<StorageByClassItem[]> {
  return apiClient<StorageByClassItem[]>('/dashboard/storage-by-class', undefined, []);
}

export async function getStorageTrend(): Promise<StorageTrendPoint[]> {
  return apiClient<StorageTrendPoint[]>('/dashboard/storage-trend', undefined, []);
}

export interface ActivityOverviewResponse {
  status: 'available' | 'pending' | 'unavailable';
  provenance: string;
  observations: ActivityMetricPoint[];
  reason?: string | null;
  updatedAt?: string;
  metricNamespace?: string;
}

export async function getActivityOverview(): Promise<ActivityOverviewResponse> {
  return apiClient<ActivityOverviewResponse>('/dashboard/activity-overview', undefined, {
    status: 'unavailable', provenance: 'UNAVAILABLE', observations: [], reason: 'Backend unavailable.',
  });
}

export async function getRecentEvents(): Promise<SystemEvent[]> {
  return apiClient<SystemEvent[]>('/dashboard/events', undefined, []);
}
