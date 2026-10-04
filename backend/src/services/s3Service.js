const {
  ListObjectsV2Command,
  ListBucketsCommand,
  GetBucketLocationCommand,
  GetBucketVersioningCommand,
  GetBucketEncryptionCommand,
  GetBucketLifecycleConfigurationCommand,
} = require("@aws-sdk/client-s3");

const s3Client = require("../aws");

const DEFAULT_BUCKET_NAME =
  process.env.DEFAULT_BUCKET || "s3-storage-lens-pavan-2026";

// Cache for bucket metadata to prevent excessive AWS API calls
let cachedBuckets = null;
let lastBucketsFetch = 0;
const BUCKETS_CACHE_TTL = 30 * 1000; // 30 seconds

// Helper functions for human-readable formatting
function formatBytes(bytes) {
  if (!bytes || bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(2)} MB`;
  const gb = mb / 1024;
  if (gb < 1024) return `${gb.toFixed(2)} GB`;
  const tb = gb / 1024;
  return `${tb.toFixed(2)} TB`;
}

function formatCount(count) {
  if (!count || count === 0) return "0";
  if (count >= 1000000) return `${(count / 1000000).toFixed(2)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return `${count}`;
}

// ========================================
// Get S3 Objects (Supports pagination across all objects)
// ========================================
async function listObjects(bucketName = DEFAULT_BUCKET_NAME) {
  try {
    const region = await getBucketRegion(bucketName);
    const client = s3Client.getS3ClientForRegion(region);

    let allObjects = [];
    let continuationToken = undefined;
    let isTruncated = true;

    while (isTruncated) {
      const command = new ListObjectsV2Command({
        Bucket: bucketName,
        ContinuationToken: continuationToken,
        MaxKeys: 1000,
      });

      const data = await client.send(command);
      if (data.Contents && data.Contents.length > 0) {
        allObjects = allObjects.concat(data.Contents);
      }

      isTruncated = !!data.IsTruncated;
      continuationToken = data.NextContinuationToken;
    }

    return allObjects;
  } catch (error) {
    console.error(`Error listing objects for bucket ${bucketName}:`, error.message);
    throw error;
  }
}

// ========================================
// Get Bucket Region
// ========================================
async function getBucketRegion(bucketName) {
  try {
    const loc = await s3Client.send(
      new GetBucketLocationCommand({ Bucket: bucketName })
    );
    // LocationConstraint is null or empty string for us-east-1
    return loc.LocationConstraint || "us-east-1";
  } catch (error) {
    console.error(`Error discovering AWS region for bucket ${bucketName}:`, error.message);
    throw error;
  }
}

// ========================================
// Calculate S3 Storage Metrics (Existing + Extended)
// ========================================
async function getMetrics(bucketName = DEFAULT_BUCKET_NAME) {
  const objects = await listObjects(bucketName);

  let totalStorageBytes = 0;
  const fileTypes = {};
  const storageClasses = {};

  for (const object of objects) {
    const size = object.Size || 0;
    const key = object.Key || "";

    totalStorageBytes += size;

    const fileName = key.split("/").pop() || "";
    const extension = fileName.includes(".")
      ? fileName.split(".").pop().toLowerCase()
      : "unknown";

    fileTypes[extension] = (fileTypes[extension] || 0) + 1;

    const storageClass = object.StorageClass || "STANDARD";
    storageClasses[storageClass] = (storageClasses[storageClass] || 0) + 1;
  }

  const largestObject = objects.reduce((largest, object) => {
    if (!largest || (object.Size || 0) > (largest.Size || 0)) {
      return object;
    }
    return largest;
  }, null);

  const latestObject = objects.reduce((latest, object) => {
    if (
      !latest ||
      new Date(object.LastModified) > new Date(latest.LastModified)
    ) {
      return object;
    }
    return latest;
  }, null);

  return {
    bucket: bucketName,
    objectCount: objects.length,
    totalStorageBytes: totalStorageBytes,
    totalStorageMB: Number((totalStorageBytes / (1024 * 1024)).toFixed(2)),
    totalStorageGB: Number((totalStorageBytes / (1024 * 1024 * 1024)).toFixed(4)),
    fileTypes: fileTypes,
    storageClasses: storageClasses,
    largestObject: largestObject
      ? {
          key: largestObject.Key,
          size: largestObject.Size,
          sizeMB: Number((largestObject.Size / (1024 * 1024)).toFixed(2)),
        }
      : null,
    latestObject: latestObject
      ? {
          key: latestObject.Key,
          lastModified: latestObject.LastModified,
        }
      : null,
  };
}

// ========================================
// List All Buckets with Rich Live AWS Metadata
// ========================================
async function listAllBuckets(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cachedBuckets && now - lastBucketsFetch < BUCKETS_CACHE_TTL) {
    return cachedBuckets;
  }

  try {
    const response = await s3Client.send(new ListBucketsCommand({}));
    const rawBuckets = response.Buckets || [];

    const detailedBuckets = await Promise.all(
      rawBuckets.map(async (b, index) => {
        const bucketName = b.Name;
        const region = await getBucketRegion(bucketName);
        const regionalClient = s3Client.getS3ClientForRegion(region);

        // Fetch versioning
        let versioning = false;
        try {
          const v = await regionalClient.send(
            new GetBucketVersioningCommand({ Bucket: bucketName })
          );
          versioning = v.Status === "Enabled";
        } catch (_) {}

        // Fetch encryption
        let encryption = "SSE-S3 (AES-256)";
        try {
          const enc = await regionalClient.send(
            new GetBucketEncryptionCommand({ Bucket: bucketName })
          );
          const algo =
            enc.ServerSideEncryptionConfiguration?.Rules?.[0]
              ?.ApplyServerSideEncryptionByDefault?.SSEAlgorithm;
          if (algo) encryption = algo === "aws:kms" ? "SSE-KMS" : `SSE-S3 (${algo})`;
        } catch (_) {}

        // Fetch lifecycle rules
        let lifecycleRulesCount = 0;
        try {
          const lc = await regionalClient.send(
            new GetBucketLifecycleConfigurationCommand({ Bucket: bucketName })
          );
          lifecycleRulesCount = (lc.Rules || []).length;
        } catch (_) {}

        // Fetch objects & sizes via paginated listObjects
        let objects = await listObjects(bucketName);

        const storageBytes = objects.reduce((acc, o) => acc + (o.Size || 0), 0);
        const storageMB = Number((storageBytes / (1024 * 1024)).toFixed(3));
        const storageGB = Number((storageBytes / (1024 * 1024 * 1024)).toFixed(4));
        const storageTB = Number((storageBytes / (1024 * 1024 * 1024 * 1024)).toFixed(6));
        const storageFormatted = formatBytes(storageBytes);

        // Group storage by class
        const classMap = {};
        for (const o of objects) {
          const sc = o.StorageClass || "STANDARD";
          classMap[sc] = (classMap[sc] || 0) + (o.Size || 0);
        }
        const storageByClass = Object.entries(classMap).map(([sc, bytes]) => ({
          class: sc,
          bytes: bytes,
          gb: Number((bytes / (1024 * 1024 * 1024)).toFixed(4)),
          tb: Number((bytes / (1024 * 1024 * 1024 * 1024)).toFixed(6)),
          formattedStorage: formatBytes(bytes),
          percentage:
            storageBytes > 0
              ? Number(((bytes / storageBytes) * 100).toFixed(1))
              : 100,
        }));

        if (storageByClass.length === 0) {
          storageByClass.push({
            class: "STANDARD",
            bytes: 0,
            gb: 0,
            tb: 0,
            formattedStorage: "0 B",
            percentage: 100,
          });
        }

        // Group prefixes
        const prefixMap = {};
        for (const o of objects) {
          const parts = (o.Key || "").split("/");
          const prefix = parts.length > 1 ? `/${parts[0]}/` : "/";
          if (!prefixMap[prefix]) {
            prefixMap[prefix] = { storageBytes: 0, objects: 0, storageClass: o.StorageClass || "STANDARD" };
          }
          prefixMap[prefix].storageBytes += o.Size || 0;
          prefixMap[prefix].objects += 1;
        }

        const prefixes = Object.entries(prefixMap).map(([p, data]) => ({
          prefix: p,
          storageBytes: data.storageBytes,
          storageGB: Number((data.storageBytes / (1024 * 1024 * 1024)).toFixed(4)),
          storageFormatted: formatBytes(data.storageBytes),
          objects: data.objects,
          objectsFormatted: formatCount(data.objects),
          activity: "UNAVAILABLE",
          storageClass: data.storageClass,
          getRequests: null,
          putRequests: null,
          downloadedGB: null,
        }));

        if (prefixes.length === 0) {
          prefixes.push({
            prefix: "/",
            storageBytes: 0,
            storageGB: 0,
            storageFormatted: "0 B",
            objects: 0,
            objectsFormatted: "0",
            activity: "UNAVAILABLE",
            storageClass: "STANDARD",
            getRequests: null,
            putRequests: null,
            downloadedGB: null,
          });
        }

        const formattedObjects = formatCount(objects.length);

        return {
          id: `b-${index + 1}`,
          name: bucketName,
          region: region,
          storageBytes: storageBytes,
          storageMB: storageMB,
          storageGB: storageGB,
          storageTB: storageTB,
          storageFormatted: storageFormatted,
          objects: objects.length,
          objectsFormatted: formattedObjects,
          primaryStorageClass: storageByClass[0]?.class || "STANDARD",
          activityLevel: "UNAVAILABLE",
          lastUpdated: "Just now (Live AWS discovery)",
          status: lifecycleRulesCount > 0 ? "Healthy" : "Optimization Candidate",
          versioning: versioning,
          encryption: encryption,
          lifecycleRulesCount: lifecycleRulesCount,
          storageByClass: storageByClass,
          prefixes: prefixes,
          hasHistoricalData: false,
          growthTrend: [],
        };
      })
    );

    cachedBuckets = detailedBuckets;
    lastBucketsFetch = now;
    return detailedBuckets;
  } catch (error) {
    console.error("Error listing all S3 buckets:", error.message);
    throw error;
  }
}

// ========================================
// Get Bucket By ID or Name
// ========================================
async function getBucketById(idOrName) {
  const buckets = await listAllBuckets();
  return buckets.find((b) => b.id === idOrName || b.name === idOrName);
}

module.exports = {
  listObjects,
  getMetrics,
  listAllBuckets,
  getBucketById,
  getBucketRegion,
  formatBytes,
  formatCount,
  DEFAULT_BUCKET_NAME,
};
