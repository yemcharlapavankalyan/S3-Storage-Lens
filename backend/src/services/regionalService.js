const { GetBucketReplicationCommand, GetBucketLocationCommand } = require("@aws-sdk/client-s3");
const s3Client = require("../aws");
const { listAllBuckets } = require("./s3Service");

const REGION_INFO = {
  "us-east-1": { name: "N. Virginia", coordinates: [-77.0369, 38.9072] },
  "ap-south-2": { name: "Hyderabad", coordinates: [78.4867, 17.385] },
  "ap-south-1": { name: "Mumbai", coordinates: [72.8777, 19.076] },
  "ap-southeast-1": { name: "Singapore", coordinates: [103.8198, 1.3521] },
  "us-west-2": { name: "Oregon", coordinates: [-120.5542, 43.8041] },
  "eu-west-1": { name: "Ireland", coordinates: [-6.2603, 53.3498] },
};

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB", "PB"];
  const unit = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / (1024 ** unit)).toFixed(2)} ${units[unit]}`;
}

async function getRegionalInfrastructure() {
  const buckets = await listAllBuckets();
  const regionsByCode = new Map();
  for (const bucket of buckets) {
    const region = bucket.region || "unknown";
    const group = regionsByCode.get(region) || { code: region, buckets: [], storageBytes: 0, objects: 0 };
    group.buckets.push(bucket);
    group.storageBytes += bucket.storageBytes || 0;
    group.objects += bucket.objects || 0;
    regionsByCode.set(region, group);
  }

  const regions = Array.from(regionsByCode.values()).map((group) => {
    const info = REGION_INFO[group.code];
    return {
      id: group.code,
      name: info?.name || group.code,
      awsRegion: group.code,
      role: "Observed",
      status: "Observed",
      coordinates: info?.coordinates || null,
      storageTB: Number((group.storageBytes / (1024 ** 4)).toFixed(6)),
      storageFormatted: formatBytes(group.storageBytes),
      storageBytes: group.storageBytes,
      objectsCount: group.objects,
      objectsFormatted: String(group.objects),
      bucketsCount: group.buckets.length,
      failoverReadiness: "UNVERIFIED",
      isPrimary: false,
      buckets: group.buckets.map((bucket) => bucket.name),
      replicationTargets: [],
      replicationVerification: "UNVERIFIED",
    };
  });

  const connections = [];
  for (const bucket of buckets) {
    const sourceRegion = regionsByCode.get(bucket.region);
    if (!sourceRegion) continue;
    try {
      const regionalClient = s3Client.getS3ClientForRegion(bucket.region);
      const replication = await regionalClient.send(new GetBucketReplicationCommand({ Bucket: bucket.name }));
      const sourceUiRegion = regions.find((region) => region.id === bucket.region);
      if (sourceUiRegion) sourceUiRegion.replicationVerification = "VERIFIED";
      for (const rule of replication.ReplicationConfiguration?.Rules || []) {
        if (rule.Status !== "Enabled" || !rule.Destination?.Bucket) continue;
        const targetBucket = rule.Destination.Bucket.split(":").pop();
        const targetLocation = await s3Client.send(new GetBucketLocationCommand({ Bucket: targetBucket }));
        const targetRegionCode = targetLocation.LocationConstraint || "us-east-1";
        const targetInfo = REGION_INFO[targetRegionCode];
        const sourceInfo = REGION_INFO[bucket.region];
        const targetRegion = regionsByCode.get(targetRegionCode);
        const targetName = targetInfo?.name || targetRegionCode;
        const sourceUiRegion = regions.find((region) => region.id === bucket.region);
        sourceUiRegion.replicationTargets.push({
          targetRegionId: targetRegionCode,
          targetRegionName: targetName,
          awsRegion: targetRegionCode,
          status: "Configuration enabled",
          type: "Replication",
          lastSync: "Configuration enabled; replication lag unavailable",
          bandwidth: "Unavailable",
        });
        if (sourceInfo?.coordinates && targetInfo?.coordinates) {
          connections.push({
            id: `${bucket.name}-${rule.ID || targetBucket}`,
            sourceId: bucket.region,
            targetId: targetRegion?.code || targetRegionCode,
            sourceCoordinates: sourceInfo.coordinates,
            targetCoordinates: targetInfo.coordinates,
            type: "Replication",
            status: "Configuration enabled",
            label: `${bucket.name} → ${targetBucket} (Replication configuration enabled)`,
          });
        }
      }
    } catch (error) {
      const sourceUiRegion = regions.find((region) => region.id === bucket.region);
      if (error.name === "ReplicationConfigurationNotFoundError" || error.name === "NoSuchReplicationConfiguration") {
        if (sourceUiRegion) sourceUiRegion.replicationVerification = "VERIFIED";
      } else {
        if (sourceUiRegion) sourceUiRegion.replicationVerification = "UNAVAILABLE";
        console.warn(`Could not verify replication for ${bucket.name}:`, error.message);
      }
    }
  }

  const configuredRegions = regions.length;
  const replicationPaths = connections.length;
  const replicationUnavailable = regions.filter((region) => region.replicationVerification === "UNAVAILABLE").length;
  return {
    regions,
    connections,
    summary: {
      configuredRegions,
      replicationPaths,
      failoverCandidates: 0,
      healthStatusText: `${configuredRegions} AWS bucket region${configuredRegions === 1 ? "" : "s"} observed; ${replicationPaths} enabled replication rule${replicationPaths === 1 ? "" : "s"} verified${replicationUnavailable ? `; replication status unavailable in ${replicationUnavailable} region${replicationUnavailable === 1 ? "" : "s"}` : ""}`,
      realBucketsDiscovered: buckets.map((bucket) => ({ name: bucket.name, region: bucket.region })),
    },
    dataSource: "LIVE_AWS",
  };
}

module.exports = { getRegionalInfrastructure };
