const express = require("express");
const router = express.Router();
const s3Client = require("../aws");
const { listAllBuckets } = require("../services/s3Service");
const { getStorageLensDashboard } = require("../services/storageLensService");

// Health check endpoint
router.get("/health", async (req, res) => {
  const identity = await s3Client.getCallerIdentity();
  res.json({
    status: "ok",
    service: "S3 Storage Lens & Infrastructure Optimizer API",
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    awsConnected: identity.connected,
    accountId: identity.accountId || null,
    region: identity.region,
  });
});

// Detailed AWS connection status for Settings Page & UI verification
router.get("/aws/status", async (req, res) => {
  const startTime = Date.now();
  const identity = await s3Client.getCallerIdentity(true);
  let bucketsCount = 0;
  let bucketNames = [];

  if (identity.connected) {
    try {
      const buckets = await listAllBuckets();
      bucketsCount = buckets.length;
      bucketNames = buckets.map((b) => b.name);
    } catch (_) {}
  }

  const lens = await getStorageLensDashboard();
  const latencyMs = Date.now() - startTime;

  res.json({
    connected: identity.connected,
    accountId: identity.accountId,
    arn: identity.arn,
    userId: identity.userId,
    region: identity.region,
    bucketsCount: bucketsCount,
    bucketNames: bucketNames,
    storageLensDashboard: lens.activeDashboard ? lens.activeDashboard.Id : null,
    latencyMs: latencyMs,
    checkedAt: new Date().toISOString(),
    error: identity.error || null,
  });
});

module.exports = router;
