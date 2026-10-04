const express = require("express");
const router = express.Router();
const {
  generateOptimizationCandidates,
  updateCandidateStatus,
} = require("../services/optimizationService");

// GET /api/optimization/candidates
router.get("/candidates", async (req, res) => {
  try {
    const candidates = await generateOptimizationCandidates();
    res.json(candidates);
  } catch (error) {
    console.error("Optimization candidates error:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/optimization/candidates/:id
router.get("/candidates/:id", async (req, res) => {
  try {
    const candidates = await generateOptimizationCandidates();
    const candidate = candidates.find((c) => c.id === req.params.id);
    if (!candidate) {
      return res.status(404).json({ error: `Candidate ${req.params.id} not found` });
    }
    res.json(candidate);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/optimization/candidates/:id/status
router.patch("/candidates/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: "Missing required parameter: status" });
    }

    const result = await updateCandidateStatus(req.params.id, status);
    res.json(result);
  } catch (error) {
    console.error("Update candidate status error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
