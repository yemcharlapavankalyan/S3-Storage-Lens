import {
  RegionInfrastructure,
  ReplicationConnection,
  RegionalSummaryData,
} from '../types/regional';
import { apiClient } from './api';

export interface RegionalInfrastructureResponse {
  regions: RegionInfrastructure[];
  connections: ReplicationConnection[];
  summary: RegionalSummaryData;
  dataSource: 'LIVE_AWS' | 'aws-s3-hybrid' | 'UNAVAILABLE';
}

export async function getRegionalInfrastructure(): Promise<RegionalInfrastructureResponse> {
  return apiClient<RegionalInfrastructureResponse>('/regional/infrastructure');
}
