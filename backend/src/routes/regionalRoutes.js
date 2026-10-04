const express = require("express");
const router = express.Router();
const { getRegionalInfrastructure } = require("../services/regionalService");

// GET /api/regional/infrastructure
router.get("/infrastructure", async (req, res) => {
  try {
    const data = await getRegionalInfrastructure();
    res.json(data);
  } catch (error) {
    console.error("Regional infrastructure error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
