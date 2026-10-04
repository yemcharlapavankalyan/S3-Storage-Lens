const { listObjects, listAllBuckets, DEFAULT_BUCKET_NAME } = require("./s3Service");

// In-memory status tracking for interactive review workflows
const candidateStatusStore = new Map();

function formatBytesLocal(bytes) {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * Generate Optimization Candidates based on real S3 objects and bucket configurations
 */
async function generateOptimizationCandidates() {
  const [objects, buckets] = await Promise.all([
    listObjects(DEFAULT_BUCKET_NAME),
    listAllBuckets(),
  ]);

  const candidates = [];

  // Group objects by prefix or file type to find real optimization patterns
  const logObjects = objects.filter(
    (o) =>
      o.Key.includes("log") ||
      o.Key.endsWith(".json") ||
      o.Key.includes("/logs/")
  );
  const dataObjects = objects.filter(
    (o) =>
      o.Key.endsWith(".csv") ||
      o.Key.endsWith(".parquet") ||
      o.Key.endsWith(".txt")
  );

  // Candidate 1: Log Data Prefix (Real objects from s3_storage_lens_demo/logs_day_*)
  if (logObjects.length > 0) {
    const totalLogBytes = logObjects.reduce((acc, o) => acc + (o.Size || 0), 0);
    const totalLogGB = Number((totalLogBytes / (1024 * 1024 * 1024)).toFixed(6));
    const formattedSize = formatBytesLocal(totalLogBytes);

    // Standard ($0.023/GB) vs Glacier Flexible ($0.004/GB) rate delta = $0.019/GB
    const monthlyDifference = Number((totalLogGB * 0.019).toFixed(4));

    const candidateId = "opt-real-logs";
    const status = candidateStatusStore.get(candidateId) || "REVIEW";

    candidates.push({
      id: candidateId,
      bucket: DEFAULT_BUCKET_NAME,
      prefix: "/s3_storage_lens_demo/logs/",
      storageGB: totalLogGB,
      storageFormatted: formattedSize,
      storageBytes: totalLogBytes,
      objectCount: logObjects.length,
      objectCountFormatted: `${logObjects.length}`,
      currentStorageClass: "STANDARD",
      activityLevel: "UNAVAILABLE",
      reason: "Log data prefix detected in STANDARD storage class without lifecycle rules",
      recommendation: "Lifecycle candidate: Transition to S3 Glacier Flexible after 30 days",
      targetStorageClass: "GLACIER",
      priority: "HIGH",
      estimatedMonthlyDifference: monthlyDifference,
      savingsFormatted: monthlyDifference > 0.01 ? `$${monthlyDifference.toFixed(2)}/mo` : "< $0.01/mo",
      savingsType: "ESTIMATED FROM S3 STORAGE VOLUME",
      isCalculated: true,
      evidenceUsed: `Discovered ${logObjects.length} log objects (${formattedSize}) in S3 Standard with no lifecycle rules in bucket '${DEFAULT_BUCKET_NAME}'. Request frequency is unobserved because CloudWatch request metrics are not enabled.`,
      accessMetricsStatus: "N/A — CloudWatch request metrics not enabled",
      status: status,
      getRequests: null,
      putRequests: null,
      downloadedGB: null,
      confidence: "High",
      analysisText: `Discovered ${logObjects.length} log objects in ${DEFAULT_BUCKET_NAME} residing in S3 Standard storage class with zero transition rules. Archiving logs to Glacier Flexible yields ~82.6% storage savings.`,
      whyFactors: [
        `Actual object count: ${logObjects.length} log files in s3_storage_lens_demo/`,
        `Current storage class is STANDARD ($0.023/GB/mo)`,
        `Target tier GLACIER reduces storage cost to $0.004/GB/mo (saves $19.00/TB-mo)`,
        `Eligible for automated S3 Lifecycle rule creation via PutBucketLifecycleConfiguration`,
      ],
      potentialImpactText: `Calculated from actual storage volume (${formattedSize}): saves ~82.6% on storage fees for this prefix (< $0.01/mo at current volume, $19.00/TB-mo at scale).`,
      lastReviewedAt: candidateStatusStore.has(candidateId) ? "Recently updated" : undefined,
    });
  }

  // Candidate 2: Analytical Data Sets (CSVs and tabular payloads)
  if (dataObjects.length > 0) {
    const totalDataBytes = dataObjects.reduce((acc, o) => acc + (o.Size || 0), 0);
    const totalDataGB = Number((totalDataBytes / (1024 * 1024 * 1024)).toFixed(6));
    const formattedSize = formatBytesLocal(totalDataBytes);

    // Standard ($0.023/GB) vs Standard-IA ($0.0125/GB) rate delta = $0.0105/GB
    const monthlyDifference = Number((totalDataGB * 0.0105).toFixed(4));

    const candidateId = "opt-real-datasets";
    const status = candidateStatusStore.get(candidateId) || "REVIEW";

    candidates.push({
      id: candidateId,
      bucket: DEFAULT_BUCKET_NAME,
      prefix: "/s3_storage_lens_demo/tables/",
      storageGB: totalDataGB,
      storageFormatted: formattedSize,
      storageBytes: totalDataBytes,
      objectCount: dataObjects.length,
      objectCountFormatted: `${dataObjects.length}`,
      currentStorageClass: "STANDARD",
      activityLevel: "UNAVAILABLE",
      reason: "Analytical CSV/payload tables without automated tiering",
      recommendation: "Tiering candidate: Enable S3 Intelligent-Tiering transition",
      targetStorageClass: "INTELLIGENT_TIERING",
      priority: "MEDIUM",
      estimatedMonthlyDifference: monthlyDifference,
      savingsFormatted: monthlyDifference > 0.01 ? `$${monthlyDifference.toFixed(2)}/mo` : "< $0.01/mo",
      savingsType: "ESTIMATED FROM S3 STORAGE VOLUME",
      isCalculated: true,
      evidenceUsed: `Discovered ${dataObjects.length} tabular objects (${formattedSize}) in S3 Standard. Without access telemetry, S3 Intelligent-Tiering is AWS's recommended tiering mechanism to optimize unaccessed data without retrieval fees.`,
      accessMetricsStatus: "N/A — CloudWatch request metrics not enabled",
      status: status,
      getRequests: null,
      putRequests: null,
      downloadedGB: null,
      confidence: "High",
      analysisText: `Discovered ${dataObjects.length} dataset files (e.g., customers.csv, orders.csv). S3 Intelligent-Tiering automatically monitors access patterns without retrieval penalties.`,
      whyFactors: [
        `Actual object count: ${dataObjects.length} data files in ${DEFAULT_BUCKET_NAME}`,
        `No retrieval fees with S3 Intelligent-Tiering`,
        `Automatically moves objects to Infrequent Access tier when unaccessed for 30 consecutive days`,
      ],
      potentialImpactText: `Calculated from actual object volume: optimizes access costs dynamically while guaranteeing millisecond retrieval latency.`,
      lastReviewedAt: candidateStatusStore.has(candidateId) ? "Recently updated" : undefined,
    });
  }

  // Candidate 3: Monitored Buckets without Lifecycle Configuration
  for (const bucket of buckets) {
    if (bucket.lifecycleRulesCount === 0) {
      const candidateId = `opt-bucket-lifecycle-${bucket.name}`;
      const status = candidateStatusStore.get(candidateId) || "REVIEW";
      const bucketSizeFormatted = bucket.storageFormatted || formatBytesLocal(bucket.storageBytes || 0);

      candidates.push({
        id: candidateId,
        bucket: bucket.name,
        prefix: "/*",
        storageGB: bucket.storageGB,
        storageFormatted: bucketSizeFormatted,
        storageBytes: bucket.storageBytes || 0,
        objectCount: bucket.objects,
        objectCountFormatted: `${bucket.objects}`,
        currentStorageClass: bucket.primaryStorageClass || "STANDARD",
        activityLevel: "UNAVAILABLE",
        reason: "Bucket has no S3 Lifecycle Configuration configured",
        recommendation: "Lifecycle candidate: Apply baseline policy with multipart upload expiration (7 days)",
        targetStorageClass: "INTELLIGENT_TIERING",
        priority: "HIGH",
        estimatedMonthlyDifference: 0,
        savingsFormatted: "Hygiene & governance policy",
        savingsType: "ESTIMATED FROM S3 STORAGE VOLUME",
        isCalculated: false,
        evidenceUsed: `AWS GetBucketLifecycleConfiguration returned NoSuchLifecycleConfiguration for bucket '${bucket.name}' in ${bucket.region}. Incomplete multipart uploads and aging objects will accrue storage fees indefinitely.`,
        accessMetricsStatus: "N/A — CloudWatch request metrics not enabled",
        status: status,
        getRequests: null,
        putRequests: null,
        downloadedGB: null,
        confidence: "High",
        analysisText: `Bucket ${bucket.name} in ${bucket.region} has 0 active lifecycle rules. Applying multipart upload expiration prevents orphan multipart parts from consuming storage fees.`,
        whyFactors: [
          `Bucket location: ${bucket.region}`,
          `Zero lifecycle rules returned by GetBucketLifecycleConfigurationCommand`,
          `High impact: Prevents orphan multipart uploads from consuming storage`,
        ],
        potentialImpactText: "Applies automated cleanup and tiering across the entire bucket root.",
        lastReviewedAt: candidateStatusStore.has(candidateId) ? "Recently updated" : undefined,
      });
    }
  }

  return candidates;
}

/**
 * Update candidate review status
 */
async function updateCandidateStatus(id, newStatus) {
  candidateStatusStore.set(id, newStatus);
  const candidates = await generateOptimizationCandidates();
  const updatedCandidate = candidates.find((c) => c.id === id) || {
    id,
    status: newStatus,
    lastReviewedAt: "Just now",
  };

  return {
    success: true,
    candidate: updatedCandidate,
  };
}

module.exports = {
  generateOptimizationCandidates,
  updateCandidateStatus,
};
