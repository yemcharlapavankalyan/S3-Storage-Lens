const express = require("express");
const router = express.Router();
const { listAllBuckets, getBucketById } = require("../services/s3Service");

// GET /api/buckets
router.get("/", async (req, res) => {
  try {
    const forceRefresh = req.query.refresh === "true";
    const buckets = await listAllBuckets(forceRefresh);
    res.json(buckets);
  } catch (error) {
    console.error("List buckets error:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/buckets/:id
router.get("/:id", async (req, res) => {
  try {
    const bucket = await getBucketById(req.params.id);
    if (!bucket) {
      return res.status(404).json({ error: `Bucket ${req.params.id} not found` });
    }
    res.json(bucket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
