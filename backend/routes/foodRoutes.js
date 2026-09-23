const express = require("express");
const foodService = require("../services/foodService");

const router = express.Router();

// GET /api/food - Get authentic local food recommendations via Gemini AI or curated catalog
router.get("/", async (req, res) => {
  try {
    const { destination, budget, exclude } = req.query;

    if (!destination) {
      return res.status(400).json({ message: "Destination is required" });
    }

    const result = await foodService.getFoodSpots({
      destination,
      budget: budget ? Number(budget) : undefined,
      exclude,
    });

    res.json(result);
  } catch (error) {
    console.error("Error in /api/food:", error);
    res.status(500).json({ message: "Failed to fetch food recommendations", error: error.message });
  }
});

module.exports = router;
