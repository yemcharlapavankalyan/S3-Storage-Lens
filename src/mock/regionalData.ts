import {
  RegionInfrastructure,
  ReplicationConnection,
  RegionalSummaryData,
  FailoverCriteria,
} from '../types/regional';

/**
 * PROJECT MOCK VALUES
 * NOTE: These are mock simulation values configured for this infrastructure visualization.
 * They are not real-time AWS account measurements.
 */

export const mockRegions: RegionInfrastructure[] = [
  {
    id: 'ap-south-2',
    name: 'Hyderabad',
    awsRegion: 'ap-south-2',
    role: 'Primary',
    status: 'Healthy',
    coordinates: [78.4867, 17.3850], // India [lon, lat]
    storageTB: 5.4,
    storageFormatted: '5.4 TB',
    objectsCount: 812420,
    objectsFormatted: '812K',
    bucketsCount: 4,
    failoverReadiness: 'ACTIVE',
    isPrimary: true,
    replicationTargets: [
      {
        targetRegionId: 'us-west-1',
        targetRegionName: 'N. California',
        awsRegion: 'us-west-1',
        status: 'Synchronized',
        type: 'Replication',
        lastSync: '1.2s ago',
        bandwidth: '1.4 Gbps',
      },
      {
        targetRegionId: 'ap-southeast-1',
        targetRegionName: 'Singapore',
        awsRegion: 'ap-southeast-1',
        status: 'Candidate',
        type: 'Failover path',
        lastSync: 'Pending activation',
        bandwidth: 'Staged',
      },
    ],
  },
  {
    id: 'us-west-1',
    name: 'N. California',
    awsRegion: 'us-west-1',
    role: 'Secondary',
    status: 'Ready',
    coordinates: [-122.4194, 37.7749], // US West Coast [lon, lat]
    storageTB: 2.8,
    storageFormatted: '2.8 TB',
    objectsCount: 421230,
    objectsFormatted: '421K',
    bucketsCount: 2,
    failoverReadiness: 'READY',
    isPrimary: false,
    replicationTargets: [
      {
        targetRegionId: 'ap-south-2',
        targetRegionName: 'Hyderabad',
        awsRegion: 'ap-south-2',
        status: 'Synchronized',
        type: 'Replication',
        lastSync: '1.2s ago',
        bandwidth: '1.4 Gbps',
      },
    ],
  },
  {
    id: 'ap-southeast-1',
    name: 'Singapore',
    awsRegion: 'ap-southeast-1',
    role: 'Failover Candidate',
    status: 'Evaluation',
    coordinates: [103.8198, 1.3521], // Southeast Asia [lon, lat]
    storageTB: 0,
    storageFormatted: '0 TB',
    objectsCount: 0,
    objectsFormatted: '0',
    bucketsCount: 0,
    failoverReadiness: 'EVALUATION',
    isPrimary: false,
    replicationTargets: [
      {
        targetRegionId: 'ap-south-2',
        targetRegionName: 'Hyderabad',
        awsRegion: 'ap-south-2',
        status: 'Candidate',
        type: 'Failover path',
        lastSync: 'Standby evaluation',
        bandwidth: 'Not routed',
      },
    ],
  },
];

export const mockReplicationConnections: ReplicationConnection[] = [
  {
    id: 'hyderabad-california',
    sourceId: 'ap-south-2',
    targetId: 'us-west-1',
    sourceCoordinates: [78.4867, 17.3850],
    targetCoordinates: [-122.4194, 37.7749],
    type: 'Replication',
    status: 'Active',
    label: 'Hyderabad → N. California',
  },
  {
    id: 'hyderabad-singapore',
    sourceId: 'ap-south-2',
    targetId: 'ap-southeast-1',
    sourceCoordinates: [78.4867, 17.3850],
    targetCoordinates: [103.8198, 1.3521],
    type: 'Failover path',
    status: 'Candidate',
    label: 'Hyderabad → Singapore',
  },
];

export const mockRegionalSummary: RegionalSummaryData = {
  configuredRegions: 3,
  replicationPaths: 2,
  failoverCandidates: 1,
  healthStatusText: 'All monitored regions healthy',
};

export const mockFailoverCriteria: FailoverCriteria[] = [
  {
    id: 'crit-1',
    name: 'Regional diversity',
    checked: true,
    status: 'passed',
  },
  {
    id: 'crit-2',
    name: 'Replication compatibility',
    checked: true,
    status: 'passed',
  },
  {
    id: 'crit-3',
    name: 'Capacity availability',
    checked: true,
    status: 'passed',
  },
  {
    id: 'crit-4',
    name: 'Latency evaluation',
    checked: false,
    status: 'evaluating',
  },
  {
    id: 'crit-5',
    name: 'Traffic evaluation',
    checked: false,
    status: 'evaluating',
  },
];
