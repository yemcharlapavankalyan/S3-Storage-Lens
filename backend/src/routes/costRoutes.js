const express = require("express");
const router = express.Router();
const { getCostAnalysis } = require("../services/costService");

// GET /api/cost/analysis
router.get("/analysis", async (req, res) => {
  try {
    const analysis = await getCostAnalysis();
    res.json(analysis);
  } catch (error) {
    console.error("Cost analysis error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
