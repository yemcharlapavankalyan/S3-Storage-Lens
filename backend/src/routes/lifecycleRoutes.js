const express = require("express");
const router = express.Router();
const {
  getLifecyclePolicies,
  getLifecycleSummary,
  createLifecyclePolicy,
} = require("../services/lifecycleService");

// GET /api/lifecycle/summary
router.get("/summary", async (req, res) => {
  try {
    const summary = await getLifecycleSummary();
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/lifecycle/policies
router.get("/policies", async (req, res) => {
  try {
    const policies = await getLifecyclePolicies();
    res.json(policies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/lifecycle/policies
router.post("/policies", async (req, res) => {
  try {
    const policy = await createLifecyclePolicy(req.body);
    res.status(201).json(policy);
  } catch (error) {
    console.error("Create lifecycle policy error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
