import { AnalyticsPrefixRecord, AnalyticsKpis } from '../types';
import { apiClient } from './api';

export interface AnalyticsFilterParams {
  bucket?: string;
  prefix?: string;
  storageClass?: string;
  activityLevel?: string;
  search?: string;
}

export async function getAnalyticsKpis(): Promise<AnalyticsKpis> {
  return apiClient<AnalyticsKpis>('/analytics/kpis');
}

export async function getObjectCountTrend(): Promise<any[]> {
  return apiClient<any[]>(
    '/analytics/object-trend'
  );
}

export async function getDownloadedBytesTrend(): Promise<any[]> {
  return apiClient<any[]>(
    '/analytics/downloaded-trend',
    undefined,
    []
  );
}

export async function getAnalyticsPrefixRecords(
  filters?: AnalyticsFilterParams
): Promise<AnalyticsPrefixRecord[]> {
  const queryParams = new URLSearchParams(
    (filters as Record<string, string>) || {}
  ).toString();

  return apiClient<AnalyticsPrefixRecord[]>(
    `/analytics/prefixes${queryParams ? `?${queryParams}` : ''}`
  );
}

export async function getPrefixRecordById(
  id: string
): Promise<AnalyticsPrefixRecord | undefined> {
  return apiClient<AnalyticsPrefixRecord>(
    `/analytics/prefixes/${id}`
  );
}
