const express = require("express");
const router = express.Router();
const { listAllBuckets, formatBytes, formatCount } = require("../services/s3Service");
const { getS3InventorySummary } = require("../services/storageLensService");

// GET /api/analytics/kpis
router.get("/kpis", async (req, res) => {
  try {
    const aggregated = await getS3InventorySummary();
    const buckets = await listAllBuckets();

    const totalStorageBytes = aggregated.totalStorageBytes || 0;
    const totalStorageTB = aggregated.totalStorageTB || 0;
    const totalStorageGB = aggregated.totalStorageGB || 0;
    const totalStorageMB = aggregated.totalStorageMB || 0;
    const totalStorageFormatted = aggregated.totalStorageFormatted || formatBytes(totalStorageBytes);

    const totalObjects = aggregated.totalObjects || 0;
    const totalObjectsFormatted = aggregated.totalObjectsFormatted || formatCount(totalObjects);

    const avgObjectSizeMB =
      totalObjects > 0
        ? Number(((totalStorageBytes / (1024 * 1024)) / totalObjects).toFixed(2))
        : 0;

    res.json({
      totalStorageTB: totalStorageTB,
      totalStorageGB: totalStorageGB,
      totalStorageMB: totalStorageMB,
      totalStorageBytes: totalStorageBytes,
      totalStorageFormatted: totalStorageFormatted,
      totalStorageChange: null, // No fabricated change percent
      totalObjects: totalObjects,
      totalObjectsCount: totalObjects,
      totalObjectsFormatted: totalObjectsFormatted,
      totalObjectsChange: null,
      avgObjectSizeMB: avgObjectSizeMB,
      avgObjectSizeChange: null,
      totalGetRequests: null,
      totalGetRequestsFormatted: "N/A",
      getRequestsChange: null,
      totalPutRequests: null,
      totalPutRequestsFormatted: "N/A",
      putRequestsChange: null,
      totalDownloadedTB: null,
      totalDownloadedFormatted: "N/A",
      dataDownloadedTB: null,
      dataDownloadedChange: null,
      monitoredBuckets: buckets.length,
      monitoredBucketsFormatted: `${buckets.length} Monitored bucket${buckets.length === 1 ? "" : "s"}`,
      activePrefixesTracked: buckets.reduce((acc, b) => acc + (b.prefixes?.length || 0), 0),
      periodLabel: "Current Live AWS Discovery",
      dataSource: aggregated.dataSource || "CALCULATED_FROM_S3",
      provenance: aggregated.provenance || {
        totalStorage: "CALCULATED_FROM_S3",
        totalObjects: "LIVE_AWS",
        monitoredBuckets: "LIVE_AWS",
        storageByClass: "CALCULATED_FROM_S3",
        totalGetRequests: "UNAVAILABLE",
        totalPutRequests: "UNAVAILABLE",
        totalDownloaded: "UNAVAILABLE",
        historicalTrend: "UNAVAILABLE",
      },
      reasons: aggregated.reasons || {
        requestsAndEgress: "Request and egress metrics are unavailable in the free S3 Storage Lens tier. Requires CloudWatch Request Metrics or S3 Storage Lens Advanced Tier.",
        historicalTrend: "Historical trend data is unavailable in the free S3 Storage Lens tier for these buckets.",
      },
    });
  } catch (error) {
    console.error("Analytics KPIs error:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics/object-trend
router.get("/object-trend", async (req, res) => {
  try {
    const aggregated = await getS3InventorySummary();
    // Return only genuinely available live observations; no fabricated historical curves
    const trend = [
      {
        month: "Current",
        objects: aggregated.totalObjects || 0,
        formatted: aggregated.totalObjectsFormatted || "0",
        standard: aggregated.totalObjects || 0,
        standardIa: 0,
        intelligent: 0,
        glacier: 0,
        total: aggregated.totalObjects || 0,
        isObservation: true,
      },
    ];
    res.json(trend);
  } catch (error) {
    console.error("Object trend error:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics/downloaded-trend
router.get("/downloaded-trend", (req, res) => {
  // Activity / Egress is unavailable from free Storage Lens tier without CloudWatch logs
  // Do NOT fabricate values; return empty array indicating unavailable
  res.json([]);
});

// GET /api/analytics/prefixes
router.get("/prefixes", async (req, res) => {
  try {
    const buckets = await listAllBuckets();
    let records = [];
    let recordIndex = 1;

    for (const bucket of buckets) {
      for (const p of bucket.prefixes || []) {
        const storageBytes = p.storageBytes || 0;
        const storageGB = p.storageGB || 0;
        const storageFormatted = p.storageFormatted || formatBytes(storageBytes);
        const objects = p.objects || 0;
        const objectsFormatted = p.objectsFormatted || formatCount(objects);

        records.push({
          id: `pfx-${recordIndex++}`,
          bucket: bucket.name,
          prefix: p.prefix,
          storageBytes: storageBytes,
          storageGB: storageGB,
          storageFormatted: storageFormatted,
          objects: objects,
          objectsFormatted: objectsFormatted,
          storageClass: p.storageClass || "STANDARD",
          getRequests: null, // Real AWS: unavailable in free tier
          putRequests: null, // Real AWS: unavailable in free tier
          downloadedGB: null, // Real AWS: unavailable in free tier
          activityLevel: p.activity || "UNAVAILABLE",
          trend: "Current",
          dataSource: "LIVE_AWS",
        });
      }
    }

    // Apply query filters
    const { bucket, storageClass, activityLevel, search } = req.query;

    if (bucket && bucket !== "ALL") {
      records = records.filter((r) => r.bucket === bucket);
    }
    if (storageClass && storageClass !== "ALL") {
      records = records.filter((r) => r.storageClass === storageClass);
    }
    if (activityLevel && activityLevel !== "ALL") {
      records = records.filter(
        (r) => r.activityLevel.toUpperCase() === activityLevel.toUpperCase()
      );
    }
    if (search && search.trim() !== "") {
      const q = search.toLowerCase();
      records = records.filter(
        (r) =>
          r.bucket.toLowerCase().includes(q) ||
          r.prefix.toLowerCase().includes(q)
      );
    }

    res.json(records);
  } catch (error) {
    console.error("Analytics prefixes error:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics/prefixes/:id
router.get("/prefixes/:id", async (req, res) => {
  try {
    const buckets = await listAllBuckets();
    let record = null;
    let recordIndex = 1;

    for (const bucket of buckets) {
      for (const p of bucket.prefixes || []) {
        const currentId = `pfx-${recordIndex++}`;
        if (currentId === req.params.id) {
          const storageBytes = p.storageBytes || 0;
          const storageGB = p.storageGB || 0;
          const storageFormatted = p.storageFormatted || formatBytes(storageBytes);
          const objects = p.objects || 0;
          const objectsFormatted = p.objectsFormatted || formatCount(objects);

          record = {
            id: currentId,
            bucket: bucket.name,
            prefix: p.prefix,
            storageBytes: storageBytes,
            storageGB: storageGB,
            storageFormatted: storageFormatted,
            objects: objects,
            objectsFormatted: objectsFormatted,
            storageClass: p.storageClass || "STANDARD",
            getRequests: null,
            putRequests: null,
            downloadedGB: null,
            activityLevel: p.activity || "UNAVAILABLE",
            trend: "Current",
            dataSource: "LIVE_AWS",
          };
          break;
        }
      }
      if (record) break;
    }

    if (!record) {
      return res.status(404).json({ error: "Prefix record not found" });
    }
    res.json(record);
  } catch (error) {
    console.error("Analytics prefix detail error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
