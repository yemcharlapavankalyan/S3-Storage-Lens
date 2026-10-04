const express = require("express");
const router = express.Router();
const { getStorageLensDashboard } = require("../services/storageLensService");
const {
  getStorageLensExportStatus,
  getLatestExportMetrics,
  getStorageLensExportTrends,
  getStorageLensExportPrefixes,
} = require("../services/storageLensExportService");

// Configuration metadata is available through S3 Control; metric exports can
// still be pending independently and are never represented as generated here.
router.get("/status", async (_req, res) => {
  try {
    res.json(await getStorageLensDashboard());
  } catch (error) {
    res.status(500).json({ connected: false, error: error.message, configurations: [], activeDashboard: null });
  }
});

router.get("/export/status", async (_req, res) => {
  try {
    res.json(await getStorageLensExportStatus());
  } catch (error) {
    res.status(500).json({ status: "UNAVAILABLE", provenance: "UNAVAILABLE", reason: error.message, destination: null });
  }
});

router.get(["/export/metrics", "/metrics"], async (_req, res) => {
  try {
    res.json(await getLatestExportMetrics());
  } catch (error) {
    res.status(500).json({ status: "UNAVAILABLE", provenance: "UNAVAILABLE", reason: error.message, metrics: [], account: [], buckets: [], prefixes: [] });
  }
});

router.get(["/export/trends", "/trends"], async (_req, res) => {
  try {
    res.json(await getStorageLensExportTrends());
  } catch (error) {
    res.status(500).json({ status: "UNAVAILABLE", provenance: "UNAVAILABLE", reason: error.message, observations: [] });
  }
});

router.get(["/export/prefixes", "/prefixes"], async (_req, res) => {
  try {
    res.json(await getStorageLensExportPrefixes());
  } catch (error) {
    res.status(500).json({ status: "UNAVAILABLE", provenance: "UNAVAILABLE", reason: error.message, prefixes: [] });
  }
});

module.exports = router;
