const {
  ListStorageLensConfigurationsCommand,
  GetStorageLensConfigurationCommand,
} = require("@aws-sdk/client-s3-control");

const s3Client = require("../aws");
const { listAllBuckets, formatBytes, formatCount } = require("./s3Service");

let cachedLensConfig = null;
let lastLensFetch = 0;
const LENS_CACHE_TTL = 60 * 1000;

/**
 * Fetch AWS S3 Storage Lens Dashboard Configuration
 */
async function getStorageLensDashboard(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cachedLensConfig && now - lastLensFetch < LENS_CACHE_TTL) {
    return cachedLensConfig;
  }

  const identity = await s3Client.getCallerIdentity();
  if (!identity.connected || !identity.accountId) {
    return {
      connected: false,
      message: "AWS credentials not detected or STS lookup failed",
      dashboardId: null,
      configurations: [],
    };
  }

  try {
    const listRes = await s3Client.s3ControlClient.send(
      new ListStorageLensConfigurationsCommand({
        AccountId: identity.accountId,
      })
    );

    const configurations = listRes.StorageLensConfigurationList || [];
    const preferredConfigId = process.env.STORAGE_LENS_DASHBOARD_ID || "s3-storage-lens-reviewer";
    const selectedConfiguration = configurations.find((configuration) => configuration.Id === preferredConfigId) || configurations[0];
    let activeDashboard = null;

    if (selectedConfiguration) {
      const configId = selectedConfiguration.Id;
      try {
        const detailRes = await s3Client.s3ControlClient.send(
          new GetStorageLensConfigurationCommand({
            AccountId: identity.accountId,
            ConfigId: configId,
          })
        );
        activeDashboard = detailRes.StorageLensConfiguration;
      } catch (err) {
        console.warn(`Could not get Storage Lens details for ${configId}:`, err.message);
      }
    }

    cachedLensConfig = {
      connected: true,
      accountId: identity.accountId,
      arn: identity.arn,
      dashboardCount: configurations.length,
      configurations: configurations,
      activeDashboard: activeDashboard || (selectedConfiguration ? { Id: selectedConfiguration.Id, IsEnabled: selectedConfiguration.IsEnabled } : null),
      lastSynced: new Date().toISOString(),
    };
    lastLensFetch = now;
    return cachedLensConfig;
  } catch (error) {
    console.warn("Storage Lens API lookup note:", error.message);
    return {
      connected: false,
      accountId: identity.accountId,
      error: error.message,
      requiredPermission: "s3:ListStorageLensConfigurations, s3:GetStorageLensConfiguration",
      configurations: [],
      activeDashboard: null,
    };
  }
}

/**
 * Calculate current S3 inventory summaries. These values are not Storage Lens metrics.
 */
async function getS3InventorySummary() {
  const [lensInfo, buckets] = await Promise.all([
    getStorageLensDashboard(),
    listAllBuckets(),
  ]);

  const totalStorageBytes = buckets.reduce((acc, b) => acc + (b.storageBytes || 0), 0);
  const totalStorageMB = Number((totalStorageBytes / (1024 * 1024)).toFixed(3));
  const totalStorageGB = Number((totalStorageBytes / (1024 * 1024 * 1024)).toFixed(4));
  const totalStorageTB = Number((totalStorageBytes / (1024 * 1024 * 1024 * 1024)).toFixed(6));
  const totalStorageFormatted = formatBytes(totalStorageBytes);
  const totalObjects = buckets.reduce((acc, b) => acc + (b.objects || 0), 0);
  const totalObjectsFormatted = formatCount(totalObjects);

  // Storage by Class across all monitored buckets
  const classBytesMap = {
    STANDARD: 0,
    STANDARD_IA: 0,
    INTELLIGENT_TIERING: 0,
    GLACIER: 0,
  };

  for (const bucket of buckets) {
    for (const sc of bucket.storageByClass || []) {
      const key = sc.class || "STANDARD";
      classBytesMap[key] = (classBytesMap[key] || 0) + (sc.bytes || 0);
    }
  }

  const standardBytes = classBytesMap.STANDARD || 0;
  const iaBytes = classBytesMap.STANDARD_IA || 0;
  const itBytes = classBytesMap.INTELLIGENT_TIERING || 0;
  const glacierBytes = classBytesMap.GLACIER || 0;

  const storageByClass = [
    {
      name: "S3 Standard",
      key: "STANDARD",
      bytes: standardBytes,
      gb: Number((standardBytes / (1024 * 1024 * 1024)).toFixed(4)),
      tb: Number((standardBytes / (1024 * 1024 * 1024 * 1024)).toFixed(6)),
      formattedStorage: formatBytes(standardBytes),
      percentage: totalStorageBytes > 0 ? Number(((standardBytes / totalStorageBytes) * 100).toFixed(1)) : 100,
      color: "#2563EB",
      monthlyCostEstimated: Number(((standardBytes / (1024 * 1024 * 1024)) * 0.023).toFixed(2)),
      dataSource: "CALCULATED_FROM_S3",
    },
    {
      name: "Standard-IA",
      key: "STANDARD_IA",
      bytes: iaBytes,
      gb: Number((iaBytes / (1024 * 1024 * 1024)).toFixed(4)),
      tb: Number((iaBytes / (1024 * 1024 * 1024 * 1024)).toFixed(6)),
      formattedStorage: formatBytes(iaBytes),
      percentage: totalStorageBytes > 0 ? Number(((iaBytes / totalStorageBytes) * 100).toFixed(1)) : 0,
      color: "#D97706",
      monthlyCostEstimated: Number(((iaBytes / (1024 * 1024 * 1024)) * 0.0125).toFixed(2)),
      dataSource: "CALCULATED_FROM_S3",
    },
    {
      name: "Intelligent-Tiering",
      key: "INTELLIGENT_TIERING",
      bytes: itBytes,
      gb: Number((itBytes / (1024 * 1024 * 1024)).toFixed(4)),
      tb: Number((itBytes / (1024 * 1024 * 1024 * 1024)).toFixed(6)),
      formattedStorage: formatBytes(itBytes),
      percentage: totalStorageBytes > 0 ? Number(((itBytes / totalStorageBytes) * 100).toFixed(1)) : 0,
      color: "#7C3AED",
      monthlyCostEstimated: Number(((itBytes / (1024 * 1024 * 1024)) * 0.023).toFixed(2)),
      dataSource: "CALCULATED_FROM_S3",
    },
    {
      name: "Glacier Flexible",
      key: "GLACIER",
      bytes: glacierBytes,
      gb: Number((glacierBytes / (1024 * 1024 * 1024)).toFixed(4)),
      tb: Number((glacierBytes / (1024 * 1024 * 1024 * 1024)).toFixed(6)),
      formattedStorage: formatBytes(glacierBytes),
      percentage: totalStorageBytes > 0 ? Number(((glacierBytes / totalStorageBytes) * 100).toFixed(1)) : 0,
      color: "#0284C7",
      monthlyCostEstimated: Number(((glacierBytes / (1024 * 1024 * 1024)) * 0.004).toFixed(2)),
      dataSource: "CALCULATED_FROM_S3",
    },
  ];

  // Storage Lens configuration discovery is not the same as receiving metric
  // datapoints. Current storage totals below are calculated from S3 inventory.
  const dataSource = "CALCULATED_FROM_S3";
  const provenance = {
    totalStorage: "CALCULATED_FROM_S3",
    totalObjects: "LIVE_AWS",
    monitoredBuckets: "LIVE_AWS",
    storageByClass: "CALCULATED_FROM_S3",
    totalGetRequests: "UNAVAILABLE",
    totalPutRequests: "UNAVAILABLE",
    totalDownloaded: "UNAVAILABLE",
    historicalTrend: "UNAVAILABLE",
  };
  const reasons = {
    requestsAndEgress: "No verified activity metric datapoints are currently available from the configured Storage Lens export or CloudWatch request metrics.",
    historicalTrend: "No historical Storage Lens metric series has been returned yet. Current S3 inventory is a point-in-time observation."
  };

  return {
    lensInfo,
    bucketsCount: buckets.length,
    totalStorageBytes,
    totalStorageMB,
    totalStorageGB,
    totalStorageTB,
    totalStorageFormatted,
    totalObjects,
    totalObjectsFormatted,
    storageByClass,
    dataSource,
    provenance,
    reasons,
  };
}

module.exports = {
  getStorageLensDashboard,
  getS3InventorySummary,
};
