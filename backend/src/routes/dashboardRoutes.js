const express = require("express");
const router = express.Router();
const { listAllBuckets } = require("../services/s3Service");
const { getS3InventorySummary } = require("../services/storageLensService");
const { generateOptimizationCandidates } = require("../services/optimizationService");
const { getStorageLensActivityMetrics } = require("../services/storageLensActivityService");

// GET /api/dashboard/summary
router.get("/summary", async (req, res) => {
  try {
    const [aggregated, candidates, buckets] = await Promise.all([
      getS3InventorySummary(),
      generateOptimizationCandidates(),
      listAllBuckets(),
    ]);

    const totalStorageTB = aggregated.totalStorageTB || 0;
    const totalStorageFormatted = aggregated.totalStorageFormatted || "0 B";
    const totalObjects = aggregated.totalObjects || 0;
    const formattedObjects = aggregated.totalObjectsFormatted || `${totalObjects}`;

    const totalSavings = candidates.reduce(
      (acc, c) => acc + (c.estimatedMonthlyDifference || 0),
      0
    );

    res.json({
      totalStorageTB: totalStorageTB,
      totalStorageFormatted: totalStorageFormatted,
      totalStorageBytes: aggregated.totalStorageBytes || 0,
      totalStorageChangePercent: null,
      totalObjectsCount: totalObjects,
      totalObjectsFormatted: formattedObjects,
      totalObjectsChangePercent: null,
      monitoredBucketsCount: buckets.length,
      monitoredBucketsChange: null,
      optimizationCandidatesCount: candidates.length,
      optimizationCandidatesChange: null,
      estimatedMonthlySavings: totalSavings,
      lastUpdated: "Just now (Live AWS discovery)",
      dataSource: aggregated.dataSource,
      provenance: aggregated.provenance,
    });
  } catch (error) {
    console.error("Dashboard summary error:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/dashboard/storage-by-class
router.get("/storage-by-class", async (req, res) => {
  try {
    const aggregated = await getS3InventorySummary();
    res.json(aggregated.storageByClass);
  } catch (error) {
    console.error("Storage by class error:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/dashboard/storage-trend
router.get("/storage-trend", async (req, res) => {
  try {
    const aggregated = await getS3InventorySummary();
    const currentTB = aggregated.totalStorageTB || 0;
    const standardTB = aggregated.storageByClass?.find((c) => c.key === "STANDARD")?.tb || 0;
    const standardIaTB = aggregated.storageByClass?.find((c) => c.key === "STANDARD_IA")?.tb || 0;
    const intelligentTB = aggregated.storageByClass?.find((c) => c.key === "INTELLIGENT_TIERING")?.tb || 0;
    const glacierTB = aggregated.storageByClass?.find((c) => c.key === "GLACIER")?.tb || 0;

    // Genuine current live observation - no synthetic 6-month historical curve
    const trend = [
      {
        month: "Current",
        standardTB: standardTB,
        standardIaTB: standardIaTB,
        intelligentTB: intelligentTB,
        glacierTB: glacierTB,
        totalTB: currentTB,
        isObservation: true,
      },
    ];

    res.json(trend);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/dashboard/activity-overview
router.get("/activity-overview", async (req, res) => {
  try {
    res.json(await getStorageLensActivityMetrics(req.query.refresh === "true"));
  } catch (error) {
    res.status(500).json({ status: "unavailable", provenance: "UNAVAILABLE", observations: [], reason: error.message });
  }
});

// GET /api/dashboard/events
router.get("/events", async (req, res) => {
  try {
    const buckets = await listAllBuckets();
    const totalObjs = buckets.reduce((acc, b) => acc + (b.objects || 0), 0);
    res.json([{
      id: `inventory-${Date.now()}`,
      timestamp: new Date().toISOString(),
      relativeTime: "Just now",
      title: "S3 Inventory Observation",
      description: `This request discovered ${buckets.length} buckets containing ${totalObjs} listed objects. This is a current observation, not historical Storage Lens activity.`,
      type: "METRICS_REFRESH",
      severity: "info",
    }]);
  } catch (error) {
    console.error("Events error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
