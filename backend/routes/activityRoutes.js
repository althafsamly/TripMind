const express = require("express");
const activityService = require("../services/activityService");

const router = express.Router();

// GET /api/activities - Get real activity and experience recommendations
router.get("/", async (req, res) => {
  try {
    const { destination, budget, tripType, travelers, category, exclude } = req.query;

    if (!destination) {
      return res.status(400).json({ message: "Destination is required" });
    }

    const result = await activityService.getActivities({
      destination,
      budget: budget ? Number(budget) : undefined,
      tripType,
      travelers: travelers ? Number(travelers) : 1,
      category,
      exclude,
    });

    res.json(result);
  } catch (error) {
    console.error("Error in /api/activities:", error);
    res.status(500).json({ message: "Failed to fetch activities", error: error.message });
  }
});

module.exports = router;
