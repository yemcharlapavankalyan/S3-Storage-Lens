const express = require("express");
const router = express.Router();
const {
  listObjects,
  getMetrics,
  DEFAULT_BUCKET_NAME,
} = require("../services/s3Service");

// ========================================
// Get S3 Objects
// ========================================
router.get("/objects", async (req, res) => {
  const bucket = req.query.bucket || DEFAULT_BUCKET_NAME;
  try {
    const objects = await listObjects(bucket);

    res.json({
      success: true,
      bucket: bucket,
      objectCount: objects.length,
      objects,
    });
  } catch (error) {
    console.error("S3 object error:", error);
    res.status(500).json({
      success: false,
      message: `Failed to retrieve S3 objects for bucket ${bucket}`,
      error: error.message,
    });
  }
});

// ========================================
// Get S3 Storage Metrics
// ========================================
router.get("/metrics", async (req, res) => {
  const bucket = req.query.bucket || DEFAULT_BUCKET_NAME;
  try {
    const metrics = await getMetrics(bucket);

    res.json({
      success: true,
      metrics,
    });
  } catch (error) {
    console.error("S3 metrics error:", error);
    res.status(500).json({
      success: false,
      message: `Failed to calculate S3 metrics for bucket ${bucket}`,
      error: error.message,
    });
  }
});

module.exports = router;
