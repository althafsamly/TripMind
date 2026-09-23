const express = require("express");
const vehicleService = require("../services/vehicleService");

const router = express.Router();

// GET /api/vehicles - Get authentic vehicle rental shops via Gemini AI or curated catalog
router.get("/", async (req, res) => {
  try {
    const { destination, tripType, travelers, exclude } = req.query;

    if (!destination) {
      return res.status(400).json({ message: "Destination is required" });
    }

    const result = await vehicleService.getVehicles({
      destination,
      tripType: tripType || "General",
      travelers: travelers ? Number(travelers) : 1,
      exclude,
    });

    res.json(result);
  } catch (error) {
    console.error("Error in /api/vehicles:", error);
    res.status(500).json({ message: "Failed to fetch vehicle rental shops", error: error.message });
  }
});

module.exports = router;
