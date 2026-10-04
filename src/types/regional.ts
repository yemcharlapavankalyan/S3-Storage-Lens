export type RegionRole = 'Primary' | 'Secondary' | 'Failover Candidate' | 'Observed';
export type RegionStatus = 'Healthy' | 'Ready' | 'Evaluation' | 'Observed';
export type ReplicationStatus = 'Synchronized' | 'Candidate' | 'In Progress' | 'Degraded' | 'Configuration enabled';
export type FailoverReadiness = 'READY' | 'ACTIVE' | 'EVALUATION' | 'UNVERIFIED';

export interface ReplicationTarget {
  targetRegionId: string;
  targetRegionName: string;
  awsRegion: string;
  status: ReplicationStatus;
  type: 'Replication' | 'Failover path';
  lastSync?: string;
  bandwidth?: string;
}

export interface RegionInfrastructure {
  id: string;
  name: string;
  awsRegion: string;
  role: RegionRole;
  status: RegionStatus;
  coordinates: [number, number] | null; // AWS region coordinates when mapped; null when not available
  storageTB: number;
  storageFormatted: string;
  objectsCount: number;
  objectsFormatted: string;
  bucketsCount: number;
  replicationTargets: ReplicationTarget[];
  replicationVerification?: 'VERIFIED' | 'UNAVAILABLE' | 'UNVERIFIED';
  failoverReadiness: FailoverReadiness;
  isPrimary?: boolean;
}

export interface ReplicationConnection {
  id: string;
  sourceId: string;
  targetId: string;
  sourceCoordinates: [number, number];
  targetCoordinates: [number, number];
  type: 'Replication' | 'Failover path';
  status: 'Configuration enabled' | 'Active' | 'Candidate';
  label: string;
}

export interface RegionalSummaryData {
  configuredRegions: number;
  replicationPaths: number;
  failoverCandidates: number;
  healthStatusText: string;
}

export interface FailoverCriteria {
  id: string;
  name: string;
  checked: boolean;
  status: 'passed' | 'evaluating';
}
