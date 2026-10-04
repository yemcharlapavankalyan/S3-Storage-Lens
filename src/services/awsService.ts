import { apiClient } from './api';

export interface AwsStatusResponse {
  connected: boolean;
  accountId: string | null;
  arn: string | null;
  userId: string | null;
  region: string;
  bucketsCount: number;
  bucketNames: string[];
  storageLensDashboard: string | null;
  latencyMs: number;
  checkedAt: string;
  error?: string | null;
}

export async function getAwsStatus(): Promise<AwsStatusResponse> {
  return apiClient<AwsStatusResponse>(
    '/aws/status',
    undefined,
    {
      connected: false,
      accountId: null,
      arn: null,
      userId: null,
      region: 'us-east-1',
      bucketsCount: 0,
      bucketNames: [],
      storageLensDashboard: null,
      latencyMs: 0,
      checkedAt: new Date().toISOString(),
      error: 'Backend API unreachable',
    }
  );
}
