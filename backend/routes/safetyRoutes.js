const express = require("express");
const {
  getEmergencyGuidanceWithGemini,
  SRI_LANKA_REGIONAL_HOSPITALS,
} = require("../services/geminiSafetyService");

const router = express.Router();

// National Emergency Numbers for Sri Lanka
const NATIONAL_HOTLINES = [
  { name: "Suwa Seriya Free National Ambulance", number: "1990", type: "Medical Ambulance (24/7)" },
  { name: "Sri Lanka Police Emergency", number: "119", type: "Police (24/7)" },
  { name: "Tourist Police Hotline", number: "011-2421052", type: "Tourist Protection" },
  { name: "Fire & Rescue Service", number: "110", type: "Fire & Disaster (24/7)" },
  { name: "Accident Service (General Hospital Colombo)", number: "011-2691111", type: "Trauma Care" },
  { name: "Tourist Information Centre Hotline", number: "1912", type: "Travel Information" },
];

// POST /api/safety/emergency-assist - Get AI First-Aid & Emergency Guidance
router.post("/emergency-assist", async (req, res) => {
  try {
    const { query, destination, userCoords } = req.body;

    if (!query || typeof query !== "string" || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: "Emergency situation or query description is required",
      });
    }

    const guidance = await getEmergencyGuidanceWithGemini({
      query: query.trim(),
      destination: destination || "Sri Lanka",
      userCoords,
    });

    res.json({
      success: true,
      guidance,
    });
  } catch (error) {
    console.error("Error in /api/safety/emergency-assist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate safety guidance",
      error: error.message,
    });
  }
});

// GET /api/safety/directory - Regional emergency facilities & national hotlines
router.get("/directory", (req, res) => {
  res.json({
    success: true,
    nationalHotlines: NATIONAL_HOTLINES,
    regionalHospitals: SRI_LANKA_REGIONAL_HOSPITALS,
  });
});

// GET /api/safety/health - Health check endpoint
router.get("/health", (req, res) => {
  res.json({ status: "healthy", service: "TripMind Safety & Emergency API" });
});

module.exports = router;
