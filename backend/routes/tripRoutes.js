const express = require("express");
const Trip = require("../models/Trip");
const authMiddleware = require("../middleware/authMiddleware");
const { getDestinationPhoto } = require("../services/activityImageService");
const { parseVoiceTripWithGemini } = require("../services/geminiVoiceService");
const { getWeatherAdvisoryWithGemini } = require("../services/geminiWeatherService");

const router = express.Router();

// POST /api/trips/weather-advisory - Check weather, monsoon, flood and disaster advisories with Gemini AI
router.post("/weather-advisory", async (req, res) => {
  try {
    const { destination, startDate, endDate, startMonth, endMonth, monthName } = req.body;
    if (!destination || !startDate || !endDate) {
      return res.status(400).json({ message: "destination, startDate, and endDate are required" });
    }

    const advisory = await getWeatherAdvisoryWithGemini({
      destination: String(destination).trim(),
      startDate: String(startDate).trim(),
      endDate: String(endDate).trim(),
      startMonth,
      endMonth,
      monthName,
    });

    res.json({
      success: true,
      advisory,
    });
  } catch (error) {
    console.error("Error in /api/trips/weather-advisory:", error);
    res.status(500).json({ message: "Failed to generate weather advisory", error: error.message });
  }
});

// POST /api/trips/parse-voice - Parse natural language or voice input with Gemini AI
router.post("/parse-voice", async (req, res) => {
  try {
    const { transcript, currentDate } = req.body;
    if (!transcript || typeof transcript !== "string" || !transcript.trim()) {
      return res.status(400).json({ message: "Transcript text is required" });
    }

    const plan = await parseVoiceTripWithGemini({
      transcript: transcript.trim(),
      currentDate: currentDate || new Date().toISOString().split("T")[0],
    });

    res.json({
      success: true,
      plan,
    });
  } catch (error) {
    console.error("Error in /api/trips/parse-voice:", error);
    res.status(500).json({ message: "Failed to parse voice trip", error: error.message });
  }
});

// Helper to determine destination emoji
function getDestinationEmoji(destination) {
  if (!destination) return "🌴";
  const d = destination.toLowerCase();
  if (d.includes("ella")) return "🏔️";
  if (d.includes("galle") || d.includes("mirissa") || d.includes("trincomalee") || d.includes("beach")) return "🌊";
  if (d.includes("kandy") || d.includes("nuwara eliya")) return "🌿";
  if (d.includes("sigiriya")) return "🏛️";
  if (d.includes("colombo")) return "🏙️";
  return "🌴";
}

// POST /api/trips - Save a new trip
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      destination,
      budget,
      startDate,
      endDate,
      days,
      travelers,
      tripType,
      interests,
      emoji,
      destinationImage,
      itinerary,
      selectedHotel,
      selectedActivities,
    } = req.body;

    if (!destination || !budget || !startDate || !endDate || !days) {
      return res.status(400).json({ message: "Missing required trip fields" });
    }

    const assignedEmoji = emoji || getDestinationEmoji(destination);
    const assignedPhoto = destinationImage || getDestinationPhoto(destination);

    const trip = await Trip.create({
      userId: req.userId,
      destination,
      budget: Number(budget),
      startDate,
      endDate,
      days: Number(days),
      travelers: travelers ? Number(travelers) : 1,
      tripType: tripType || "Solo",
      interests: Array.isArray(interests) ? interests : [],
      emoji: assignedEmoji,
      destinationImage: assignedPhoto,
      itinerary: Array.isArray(itinerary) ? itinerary : [],
      selectedHotel: selectedHotel || null,
      selectedActivities: Array.isArray(selectedActivities) ? selectedActivities : [],
    });

    res.status(201).json({
      message: "Trip saved successfully",
      trip,
    });
  } catch (error) {
    console.error("Error saving trip:", error);
    res.status(500).json({ message: "Failed to save trip", error: error.message });
  }
});

// GET /api/trips - Get all saved trips for authenticated user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const trips = await Trip.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(trips);
  } catch (error) {
    console.error("Error fetching trips:", error);
    res.status(500).json({ message: "Failed to fetch trips", error: error.message });
  }
});

// GET /api/trips/:id - Get specific trip by ID
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.userId });
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }
    res.json(trip);
  } catch (error) {
    console.error("Error fetching trip:", error);
    res.status(500).json({ message: "Failed to fetch trip", error: error.message });
  }
});

// DELETE /api/trips/:id - Delete a saved trip
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const deletedTrip = await Trip.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!deletedTrip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    res.json({ message: "Trip deleted successfully" });
  } catch (error) {
    console.error("Error deleting trip:", error);
    res.status(500).json({ message: "Failed to delete trip", error: error.message });
  }
});

module.exports = router;
