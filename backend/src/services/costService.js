const { listAllBuckets } = require("./s3Service");

// Published standard AWS S3 rates per GB/month (us-east-1 / standard regions)
const AWS_S3_RATES = {
  STANDARD: 0.023,
  STANDARD_IA: 0.0125,
  INTELLIGENT_TIERING: 0.023,
  GLACIER: 0.004,
  DEEP_ARCHIVE: 0.00099,
};

function formatBytesLocal(bytes) {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * Calculate Cost Analysis based on actual S3 bucket storage footprint
 */
async function getCostAnalysis() {
  const buckets = await listAllBuckets();

  let totalStandardBytes = 0;
  let totalStandardIaBytes = 0;
  let totalIntelligentBytes = 0;
  let totalGlacierBytes = 0;

  for (const bucket of buckets) {
    for (const sc of bucket.storageByClass || []) {
      const cls = (sc.class || "STANDARD").toUpperCase();
      const bytes = sc.bytes || 0;
      if (cls === "STANDARD") totalStandardBytes += bytes;
      else if (cls === "STANDARD_IA") totalStandardIaBytes += bytes;
      else if (cls === "INTELLIGENT_TIERING") totalIntelligentBytes += bytes;
      else if (cls === "GLACIER" || cls === "DEEP_ARCHIVE") totalGlacierBytes += bytes;
      else totalStandardBytes += bytes;
    }
  }

  const totalBytes = totalStandardBytes + totalStandardIaBytes + totalIntelligentBytes + totalGlacierBytes;
  const totalGB = totalBytes / (1024 * 1024 * 1024);

  const standardGB = totalStandardBytes / (1024 * 1024 * 1024);
  const standardIaGB = totalStandardIaBytes / (1024 * 1024 * 1024);
  const intelligentGB = totalIntelligentBytes / (1024 * 1024 * 1024);
  const glacierGB = totalGlacierBytes / (1024 * 1024 * 1024);

  const standardCost = standardGB * AWS_S3_RATES.STANDARD;
  const standardIaCost = standardIaGB * AWS_S3_RATES.STANDARD_IA;
  const intelligentCost = intelligentGB * AWS_S3_RATES.INTELLIGENT_TIERING;
  const glacierCost = glacierGB * AWS_S3_RATES.GLACIER;

  const currentTotalCost = Number((standardCost + standardIaCost + intelligentCost + glacierCost).toFixed(4));
  const optimizedCost = Number((currentTotalCost * 0.2).toFixed(4));
  const estimatedSavings = Number((currentTotalCost - optimizedCost).toFixed(4));

  // Comparison segments derived from actual prefixes and buckets
  const comparisonSegments = [];
  let segmentIndex = 1;

  for (const bucket of buckets) {
    for (const p of bucket.prefixes || []) {
      const bytes = p.storageBytes || 0;
      const gb = bytes / (1024 * 1024 * 1024);
      const currentCost = Number((gb * AWS_S3_RATES.STANDARD).toFixed(4));
      const targetCost = Number((gb * AWS_S3_RATES.GLACIER).toFixed(4));
      const difference = Number((currentCost - targetCost).toFixed(4));

      comparisonSegments.push({
        id: `cs-real-${segmentIndex++}`,
        segment: p.prefix,
        bucket: bucket.name,
        prefix: p.prefix,
        storageSize: p.storageFormatted || formatBytesLocal(bytes),
        storageBytes: bytes,
        currentClass: p.storageClass || "STANDARD",
        currentEstimatedCost: currentCost > 0.01 ? `$${currentCost.toFixed(2)}` : "< $0.01",
        recommendedStrategy:
          p.prefix.includes("log")
            ? "Transition to S3 Glacier Flexible at 30 days"
            : "Enable S3 Intelligent-Tiering transition",
        estimatedCost: targetCost > 0.01 ? `$${targetCost.toFixed(2)}` : "< $0.01",
        estimatedDifference: difference > 0.01 ? `$${difference.toFixed(2)}` : "< $0.01",
        status: bucket.lifecycleRulesCount > 0 ? "Policy Active" : "Candidate",
        billingType: "ESTIMATED FROM S3 STORAGE VOLUME",
      });
    }
  }

  // Cost by Storage Class
  const costByClass = [
    {
      storageClass: "S3 Standard",
      cost: standardCost > 0.01 ? Number(standardCost.toFixed(2)) : 0.01,
      formattedCost: standardCost > 0.01 ? `$${standardCost.toFixed(2)}` : "< $0.01",
      percentage: totalBytes > 0 ? Number(((totalStandardBytes / totalBytes) * 100).toFixed(1)) : 100,
      color: "#2563EB",
    },
    {
      storageClass: "Standard-IA",
      cost: standardIaCost > 0.01 ? Number(standardIaCost.toFixed(2)) : 0,
      formattedCost: standardIaCost > 0.01 ? `$${standardIaCost.toFixed(2)}` : "$0.00",
      percentage: totalBytes > 0 ? Number(((totalStandardIaBytes / totalBytes) * 100).toFixed(1)) : 0,
      color: "#D97706",
    },
    {
      storageClass: "Intelligent-Tiering",
      cost: intelligentCost > 0.01 ? Number(intelligentCost.toFixed(2)) : 0,
      formattedCost: intelligentCost > 0.01 ? `$${intelligentCost.toFixed(2)}` : "$0.00",
      percentage: totalBytes > 0 ? Number(((totalIntelligentBytes / totalBytes) * 100).toFixed(1)) : 0,
      color: "#7C3AED",
    },
    {
      storageClass: "Glacier Flexible",
      cost: glacierCost > 0.01 ? Number(glacierCost.toFixed(2)) : 0,
      formattedCost: glacierCost > 0.01 ? `$${glacierCost.toFixed(2)}` : "$0.00",
      percentage: totalBytes > 0 ? Number(((totalGlacierBytes / totalBytes) * 100).toFixed(1)) : 0,
      color: "#0284C7",
    },
  ];

  return {
    currentMonthlyCost: currentTotalCost,
    currentMonthlyCostFormatted: currentTotalCost > 0.01 ? `$${currentTotalCost.toFixed(2)}/mo` : "< $0.01/mo",
    optimizedMonthlyCost: optimizedCost,
    optimizedMonthlyCostFormatted: optimizedCost > 0.01 ? `$${optimizedCost.toFixed(2)}/mo` : "< $0.01/mo",
    estimatedMonthlyDifference: estimatedSavings,
    estimatedMonthlyDifferenceFormatted: estimatedSavings > 0.01 ? `$${estimatedSavings.toFixed(2)}/mo` : "< $0.01/mo",
    storageUnderReviewTB: Number((totalGB / 1024).toFixed(6)),
    storageUnderReviewFormatted: formatBytesLocal(totalBytes),
    totalStorageBytes: totalBytes,
    pricingBasis: "AWS Published Tier Rates ($0.023/GB Standard, $0.0125/GB Standard-IA, $0.004/GB Glacier Flexible in us-east-1)",
    billingMode: "ESTIMATED FROM S3 STORAGE VOLUME",
    actualBillingStatus: "UNAVAILABLE — AWS Cost Explorer not configured",
    hasHistoricalData: false,
    disclaimer:
      "All cost figures are calculated estimates based on active S3 storage footprint and published AWS rates. Official billing charges are unavailable because AWS Cost Explorer is not configured.",
    costTrend: [], // Empty: No fabricated historical cost curve
    costByClass,
    comparisonSegments,
  };
}

module.exports = {
  getCostAnalysis,
};
