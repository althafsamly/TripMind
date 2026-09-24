// Gemini AI Vehicle & Scooter Rental Service Provider
// Generates accurate, destination-specific vehicle rental shops using Google Gemini

async function fetchVehiclesWithGemini({ destination, tripType = "Solo", travelers = 1, exclude = [] }) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in .env");
  }

  const excludeList = Array.isArray(exclude)
    ? exclude
    : (exclude || "").split(",").map((s) => s.trim()).filter(Boolean);

  const excludeClause = excludeList.length > 0
    ? `CRITICAL EXCLUSION: Do NOT include any of the following rental shops: ${excludeList.join(", ")}.\n`
    : "";

  const prompt = `You are a Sri Lanka transport expert with deep knowledge of real vehicle rental shops, tuk-tuk services, and local transport options across every city and region in Sri Lanka.
Generate exactly 3 or 4 REAL, well-rated vehicle rental shops, tuk-tuk services, or local transport options that ACTUALLY EXIST in or immediately around "${destination}", Sri Lanka.

${excludeClause}Traveler Context:
- Destination: ${destination}, Sri Lanka
- Trip Style: ${tripType || "General"}
- Travelers: ${travelers || 1}

Requirements:
- Recommend transport options that are ACTUALLY AVAILABLE and commonly used in ${destination}, Sri Lanka.
- Typical Sri Lanka transport options: Tuk-Tuk rental, scooter/motorbike rental, private car hire with driver, PickMe taxi, local bus.
- Rates in Sri Lankan Rupees (LKR).
- Genuine ratings (4.5–4.9) and realistic review counts.
- Real local street address or area in ${destination}, Sri Lanka.
- 2-3 relevant features.

You MUST reply with ONLY a raw JSON array of 3 or 4 objects. No markdown, no explanation.

JSON format:
[
  {
    "id": "slug-string",
    "shopName": "Exact Real Transport Service or Rental Shop Name in ${destination}",
    "vehicleType": "Car Rental" | "Scooter / Motorbike" | "Tuk-Tuk" | "Private Chauffeur" | "Taxi / Rideshare",
    "icon": "🚗" | "🛵" | "🚺" | "🚕",
    "rate": "~LKR 3,500/day",
    "rating": 4.8,
    "reviews": 120,
    "badge": "Top Pick" | "Recommended" | "Adventure Choice" | "Family Choice" | "Best Value",
    "reason": "Why this vehicle type suits ${destination} geography or traveler style",
    "location": "Street, area, or landmark in ${destination}, Sri Lanka",
    "features": ["GPS included", "Free cancellation", "Insurance included"]
  }
]`;

  const candidateModels = [
    ...new Set([
      process.env.GEMINI_MODEL,
      "gemini-3.6-flash",
      "gemini-3.5-flash-lite",
      "gemini-3.5-flash",
      "gemini-3.7-flash",
      "gemini-3.8-flash",
      "gemini-flash-latest",
    ].filter(Boolean)),
  ];

  let data = null;
  let lastError = null;

  for (const model of candidateModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.4,
            responseMimeType: "application/json",
          },
        }),
        signal: AbortSignal.timeout(7000),
      });

      if (response.ok) {
        data = await response.json();
        console.log(`[GeminiVehicleService] Successfully generated rental shops using model: ${model}`);
        break;
      }

      const errorText = await response.text();
      lastError = new Error(`Model ${model} failed (${response.status}): ${errorText.slice(0, 200)}`);
      console.warn(`[GeminiVehicleService] Model ${model} returned ${response.status}. Trying next candidate model...`);
      continue;
    } catch (e) {
      lastError = e;
      console.warn(`[GeminiVehicleService] Model ${model} failed (${e.message}). Trying next candidate model...`);
      continue;
    }
  }

  if (!data) {
    throw lastError || new Error("Failed to get response from any Gemini model");
  }

  const textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textOutput) {
    throw new Error("Empty response from Gemini API");
  }

  const cleaned = textOutput.replace(/```json/g, "").replace(/```/g, "").trim();
  const rawList = JSON.parse(cleaned);

  if (!Array.isArray(rawList) || rawList.length === 0) {
    throw new Error("Gemini returned invalid list format");
  }

  return rawList.map((shop, index) => {
    const shopName = shop.shopName || `Vehicle Rental in ${destination}`;
    const vehicleType = shop.vehicleType || "Scooter";
    return {
      id: shop.id || `gemini-vehicle-${destination.toLowerCase()}-${Date.now()}-${index}`,
      shopName,
      vehicleType,
      icon: shop.icon || (vehicleType.toLowerCase().includes("scooter") ? "🛵" : vehicleType.toLowerCase().includes("tuk") ? "🛺" : vehicleType.toLowerCase().includes("car") ? "🚗" : "📱"),
      rate: shop.rate || "Rs. 3,500/day",
      rating: Number(shop.rating) || 4.7,
      reviews: Number(shop.reviews) || 95,
      badge: shop.badge || "✨ AI Recommendation",
      reason: shop.reason || "Recommended transport for exploring this destination.",
      location: shop.location || `Central ${destination}`,
      features: Array.isArray(shop.features) ? shop.features : ["Standard Insurance", "Helmets/Safety Included"],
      googleMapsUrl: `https://www.google.com/maps/search/${encodeURIComponent(`${shopName} ${destination}`)}`,
      source: "gemini",
    };
  });
}

module.exports = {
  fetchVehiclesWithGemini,
};
