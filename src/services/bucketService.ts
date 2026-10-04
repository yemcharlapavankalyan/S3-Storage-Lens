import { Bucket } from '../types';
import { apiClient } from './api';

export async function getBuckets(): Promise<Bucket[]> {
  return apiClient<Bucket[]>('/buckets');
}

export async function getBucketById(id: string): Promise<Bucket | undefined> {
  return apiClient<Bucket>(`/buckets/${id}`);
}
