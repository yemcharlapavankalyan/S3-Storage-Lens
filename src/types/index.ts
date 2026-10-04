export type ActivityLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'VERY_LOW' | 'UNAVAILABLE';
export type PriorityLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type CandidateStatus = 'REVIEW' | 'APPROVED' | 'REJECTED';
export type BucketStatus = 'Healthy' | 'Optimization Candidate' | 'Review';
export type PolicyStatus = 'Active' | 'Review' | 'Draft';

export type MetricDataSource =
  | 'LIVE_AWS'
  | 'CALCULATED_FROM_S3'
  | 'STORAGE_LENS'
  | 'UNAVAILABLE'
  | 'MOCK_FALLBACK';

export interface StorageSummary {
  totalStorageTB: number;
  totalStorageGB?: number;
  totalStorageMB?: number;
  totalStorageBytes?: number;
  totalStorageFormatted?: string;
  totalStorageChangePercent?: number | null;
  totalObjectsCount: number;
  totalObjectsFormatted: string;
  totalObjectsChangePercent?: number | null;
  monitoredBucketsCount: number;
  monitoredBucketsChange?: number | null;
  optimizationCandidatesCount: number;
  optimizationCandidatesChange?: number | null;
  estimatedMonthlySavings: number;
  lastUpdated: string;
  dataSource?: MetricDataSource | string;
  provenance?: Record<string, string>;
}

export interface StorageByClassItem {
  name: string;
  key: string;
  tb: number;
  gb: number;
  bytes?: number;
  formattedStorage?: string;
  percentage: number;
  color: string;
  monthlyCostEstimated: number;
  dataSource?: MetricDataSource | string;
}

export interface StorageTrendPoint {
  month: string;
  standardTB: number;
  standardIaTB: number;
  intelligentTB: number;
  glacierTB: number;
  totalTB: number;
  isObservation?: boolean;
}

export interface ActivityMetricPoint {
  date: string;
  getRequests: number | null;
  putRequests: number | null;
  downloadedGB: number | null;
}

export interface SystemEvent {
  id: string;
  timestamp: string;
  relativeTime: string;
  title: string;
  description: string;
  type: 'METRICS_REFRESH' | 'OPTIMIZATION_FOUND' | 'LIFECYCLE_TRIGGER' | 'BUCKET_DISCOVERED' | 'COST_ANALYSIS';
  severity: 'info' | 'success' | 'warning' | 'critical';
  resourceId?: string;
}

export interface BucketPrefix {
  prefix: string;
  storageGB: number;
  objects: number;
  activity: string;
  storageClass: string;
}

export interface Bucket {
  id: string;
  name: string;
  region: string;
  storageTB: number;
  storageGB: number;
  objects: number;
  objectsFormatted: string;
  primaryStorageClass: string;
  activityLevel: 'High' | 'Medium' | 'Low' | 'Very Low' | 'UNAVAILABLE';
  lastUpdated: string;
  status: BucketStatus;
  versioning: boolean;
  encryption: string;
  lifecycleRulesCount: number;
  storageByClass: { class: string; gb: number; percentage: number }[];
  prefixes: BucketPrefix[];
  growthTrend: { month: string; storageTB: number }[];
}

export interface OptimizationCandidate {
  id: string;
  bucket: string;
  prefix: string;
  storageGB: number;
  storageFormatted: string;
  storageBytes?: number;
  objectCount: number;
  objectCountFormatted: string;
  currentStorageClass: string;
  activityLevel: ActivityLevel;
  reason: string;
  recommendation: string;
  targetStorageClass: string;
  priority: PriorityLevel;
  estimatedMonthlyDifference: number;
  savingsFormatted?: string;
  savingsType?: 'ACTUAL AWS BILLING' | 'ESTIMATED FROM S3 STORAGE VOLUME';
  isCalculated?: boolean;
  evidenceUsed?: string;
  accessMetricsStatus?: string;
  status: CandidateStatus;
  getRequests?: number | null;
  putRequests?: number | null;
  downloadedGB?: number | null;
  confidence: 'High' | 'Medium' | 'Low';
  analysisText: string;
  whyFactors: string[];
  potentialImpactText: string;
  lastReviewedAt?: string;
}

export interface LifecycleStage {
  order: number;
  storageClass: string;
  daysAfterCreation: number;
  description: string;
}

export interface LifecyclePolicy {
  id: string;
  policyName: string;
  bucket: string;
  prefix: string;
  currentClass: string;
  targetClass: string;
  transitionDays: number | null;
  expirationDays: number | null;
  status: PolicyStatus;
  lastUpdated: string;
  stages: LifecycleStage[];
  objectsImpacted: number;
  estimatedSavings: string;
  createdDate: string;
}

export interface CostComparisonSegment {
  id: string;
  segment: string;
  bucket: string;
  prefix: string;
  storageSize: string;
  currentClass: string;
  currentEstimatedCost: number;
  recommendedStrategy: string;
  estimatedCost: number;
  estimatedDifference: number;
  status: 'Candidate' | 'Under Review' | 'Policy Active';
}

export interface CostAnalysis {
  currentMonthlyCost: number;
  currentMonthlyCostFormatted?: string;
  optimizedMonthlyCost: number;
  optimizedMonthlyCostFormatted?: string;
  estimatedMonthlyDifference: number;
  estimatedMonthlyDifferenceFormatted?: string;
  storageUnderReviewTB: number;
  storageUnderReviewFormatted?: string;
  totalStorageBytes?: number;
  pricingBasis?: string;
  billingMode?: string;
  actualBillingStatus?: string;
  hasHistoricalData?: boolean;
  disclaimer?: string;
  costTrend: { month: string; currentCost: number; projectedCost: number }[];
  costByClass: { storageClass: string; cost: number; formattedCost?: string; percentage: number; color: string }[];
  comparisonSegments: CostComparisonSegment[];
}

export interface AnalyticsKpis {
  totalStorageTB: number;
  totalStorageGB?: number;
  totalStorageMB?: number;
  totalStorageBytes?: number;
  totalStorageFormatted: string;
  totalStorageChange?: number | null;
  totalObjects: number;
  totalObjectsCount?: number;
  totalObjectsFormatted: string;
  totalObjectsChange?: number | null;
  avgObjectSizeMB?: number;
  avgObjectSizeChange?: number | null;
  totalGetRequests?: number | null;
  totalGetRequestsFormatted: string;
  getRequestsChange?: number | null;
  totalPutRequests?: number | null;
  totalPutRequestsFormatted: string;
  putRequestsChange?: number | null;
  totalDownloadedTB?: number | null;
  totalDownloadedFormatted: string;
  dataDownloadedTB?: number | null;
  dataDownloadedChange?: number | null;
  monitoredBuckets: number;
  monitoredBucketsFormatted: string;
  activePrefixesTracked?: number;
  periodLabel: string;
  dataSource?: MetricDataSource | string;
  provenance?: {
    totalStorage?: MetricDataSource | string;
    totalObjects?: MetricDataSource | string;
    monitoredBuckets?: MetricDataSource | string;
    storageByClass?: MetricDataSource | string;
    totalGetRequests?: MetricDataSource | string;
    totalPutRequests?: MetricDataSource | string;
    totalDownloaded?: MetricDataSource | string;
    historicalTrend?: MetricDataSource | string;
  };
  reasons?: {
    requestsAndEgress?: string;
    historicalTrend?: string;
  };
}

export interface AnalyticsPrefixRecord {
  id: string;
  bucket: string;
  prefix: string;
  storageBytes?: number;
  storageGB: number;
  storageFormatted: string;
  objects: number;
  objectsFormatted: string;
  storageClass: string;
  getRequests: number | null;
  putRequests: number | null;
  downloadedGB: number | null;
  activityLevel: 'High' | 'Medium' | 'Low' | 'Very Low' | 'UNAVAILABLE';
  trend: '↑ High growth' | '→ Stable' | '↓ Low activity' | '↕ Fluctuating' | 'Current' | string;
  dataSource?: MetricDataSource | string;
}

export interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  timestamp: Date;
}
