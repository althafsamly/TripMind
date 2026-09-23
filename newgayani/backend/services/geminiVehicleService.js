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

  const prompt = `You are an expert Sri Lankan transport advisor and local travel guide.
Generate exactly 3 or 4 real, authentic, well-rated vehicle rental shops, scooter hire outlets, or transport hire services in or immediately around "${destination}", Sri Lanka.

${excludeClause}Traveler Context:
- Destination: ${destination}, Sri Lanka
- Trip Style: ${tripType || "General"}
- Travelers: ${travelers || 1}

Core Vehicle Recommendation Rules:
- For Mirissa, Ahangama, Weligama, Galle, or coastal/beach areas (especially Solo/Couple):
  Highlight 🛵 Scooter rentals (Reason: "Coastal roads, easy beach hopping").
- For Ella, Sigiriya, Dambulla, or adventure travelers:
  Highlight 🛺 Self-Drive Tuk-Tuk rentals (Reason: "Fun rural exploration, scenic mountain drives").
- For Kandy, Nuwara Eliya, Hatton, or family/group trips:
  Highlight 🚗 Private Car with Driver (Reason: "Winding mountain roads, comfortable for group").
- For Colombo:
  Highlight 📱 PickMe / Uber App & city taxi/rental hubs (Reason: "High traffic, easy ride-hailing").

Requirements:
- Provide real rental businesses or authentic local transport providers in ${destination}.
- Accurate rates in Sri Lankan Rupees (LKR) e.g., ~Rs. 3,500/day for scooters, ~Rs. 6,000/day for tuk-tuks, ~Rs. 14,000/day for private chauffeur cars, or "Metered / On Demand" for Colombo ride-hailing.
- Genuine ratings (between 4.5 and 4.9) and review counts.
- Realistic local street address or neighborhood in ${destination}.
- 2-3 valuable features (e.g. "Helmets included", "Surf rack available", "Free hotel delivery", "Driving lesson included", "AC vehicle & English-speaking chauffeur").

You MUST reply with ONLY a raw JSON array containing 3 or 4 objects. Do not include markdown codeblocks or other text.

JSON format:
[
  {
    "id": "slug-string",
    "shopName": "Exact Rental Shop Name in ${destination}",
    "vehicleType": "Scooter" | "Self-Drive Tuk-Tuk" | "Private Car with Driver" | "PickMe / Uber App",
    "icon": "🛵" | "🛺" | "🚗" | "📱",
    "rate": "Rs. 3,500/day",
    "rating": 4.8,
    "reviews": 120,
    "badge": "Top Pick" | "Recommended" | "Adventure Choice" | "Family Choice" | "Best Value",
    "reason": "Accise reason why this vehicle suits ${destination} (e.g., Coastal roads, easy beach hopping)",
    "location": "Street, area, or landmark in ${destination}",
    "features": ["Helmets included", "Free hotel delivery", "Insurance options"]
  }
]`;

  const candidateModels = [
    ...new Set([
      process.env.GEMINI_MODEL,
      "gemini-3.6-flash",
      "gemini-3.5-flash-lite",
      "gemini-3.7-flash",
      "gemini-3.5-flash",
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
        signal: AbortSignal.timeout(20000),
      });

      if (response.ok) {
        data = await response.json();
        console.log(`[GeminiVehicleService] Successfully generated rental shops using model: ${model}`);
        break;
      }

      const errorText = await response.text();
      lastError = new Error(`Model ${model} failed (${response.status}): ${errorText}`);

      if ([503, 429, 500, 404].includes(response.status) || errorText.includes("demand") || errorText.includes("not found")) {
        console.warn(`[GeminiVehicleService] Model ${model} returned ${response.status}. Trying next candidate model...`);
        continue;
      } else {
        throw lastError;
      }
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
      googleMapsUrl: `https://www.google.com/maps/search/${encodeURIComponent(`${shopName} ${destination} Sri Lanka`)}`,
      source: "gemini",
    };
  });
}

module.exports = {
  fetchVehiclesWithGemini,
};
