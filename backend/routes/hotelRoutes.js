const express = require("express");
const hotelService = require("../services/hotelService");

const router = express.Router();

// GET /api/hotels - Get hotel recommendations
router.get("/", async (req, res) => {
  try {
    const { destination, budget, startDate, endDate, travelers, exclude } = req.query;

    if (!destination) {
      return res.status(400).json({ message: "Destination is required" });
    }

    const result = await hotelService.getHotels({
      destination,
      budget: budget ? Number(budget) : undefined,
      startDate,
      endDate,
      travelers: travelers ? Number(travelers) : 1,
      exclude,
    });

    res.json(result);
  } catch (error) {
    console.error("Error in /api/hotels:", error);
    res.status(500).json({ message: "Failed to fetch hotels", error: error.message });
  }
});

module.exports = router;
