const express = require("express");
const activityImageService = require("../services/activityImageService");
const pexelsService = require("../services/pexelsService");
const wikimediaService = require("../services/wikimediaService");

const router = express.Router();

/**
 * GET /api/images/destination-header
 * Resolves high-resolution Pexels destination header background with local asset fallback
 */
router.get("/destination-header", async (req, res) => {
  try {
    const { destination } = req.query;
    if (!destination) {
      return res.status(400).json({ message: "destination parameter is required" });
    }

    const result = await activityImageService.getDestinationHeaderPhoto(destination);
    res.json(result);
  } catch (error) {
    console.error("Error in /api/images/destination-header:", error);
    res.status(500).json({
      message: "Failed to resolve destination header image",
      error: error.message,
    });
  }
});

/**
 * GET /api/images/search
 * Resolves images for specific activities or destinations
 */
router.get("/search", async (req, res) => {
  try {
    const { query, type = "activity", destination = "" } = req.query;
    if (!query) {
      return res.status(400).json({ message: "query parameter is required" });
    }

    if (type === "destination") {
      const result = await activityImageService.getDestinationHeaderPhoto(query);
      return res.json(result);
    }

    // Default: activity search
    const enriched = await activityImageService.enrichActivitiesWithPhotos(
      [{ title: query, description: "", category: "Sightseeing" }],
      destination
    );

    res.json(enriched[0] || {});
  } catch (error) {
    console.error("Error in /api/images/search:", error);
    res.status(500).json({
      message: "Failed to search image",
      error: error.message,
    });
  }
});

module.exports = router;
