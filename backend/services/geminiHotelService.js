// Gemini AI Hotel Service Provider
// Generates accurate, destination-specific hotel recommendations using Google Gemini

const hotelImageService = require("./hotelImageService");

async function fetchHotelsWithGemini({ destination, budget = 75000, nights = 3, travelers = 1, tripType = "Solo", exclude = [] }) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in .env");
  }

  const targetNightlyBudget = Math.round((budget * 0.4) / Math.max(1, nights));

  const excludeList = Array.isArray(exclude)
    ? exclude
    : (exclude || "").split(",").map((s) => s.trim()).filter(Boolean);

  const excludeClause = excludeList.length > 0
    ? `CRITICAL EXCLUSION: Do NOT include any of the following hotels (they are already displayed to the user): ${excludeList.join(", ")}. Suggest 4 DIFFERENT authentic hotels or guesthouses in ${destination}.\n`
    : "";

  const prompt = `You are an expert Sri Lankan travel guide and hotel concierge.
Generate exactly 4 real, well-known, authentic hotels, boutique resorts, or guesthouses in or immediately around "${destination}", Sri Lanka.

${excludeClause}User Context:
- Destination: ${destination}, Sri Lanka
- Total Trip Budget: LKR ${budget}
- Stay Duration: ${nights} nights
- Target Nightly Accommodation Budget: ~LKR ${targetNightlyBudget} / night
- Travelers: ${travelers} (${tripType})

Requirements:
- Recommend 4 real accommodations spanning different tiers:
  - 1 Luxury (high-end resort or 5-star hotel)
  - 2 Comfort / Boutique (stylish 3-4 star hotels or popular boutique villas)
  - 1 Budget (clean, highly-rated guesthouse or backpacker stay)
- All prices must be realistic nightly rates in Sri Lankan Rupees (LKR).
- Include genuine ratings (between 4.2 and 4.9) and 4-6 typical amenities.
- Include a specific room type and location highlight (e.g. proximity to landmarks).

You MUST reply with ONLY a raw JSON array containing exactly 4 objects. Do not include markdown codeblocks, do not include explanations.

JSON format:
[
  {
    "id": "unique-slug-string",
    "name": "Exact Hotel Name",
    "tier": "Luxury" | "Comfort" | "Budget",
    "pricePerNight": 25000,
    "rating": 4.7,
    "reviews": 320,
    "amenities": ["Infinity Pool", "Free Breakfast", "Mountain View", "WiFi"],
    "badge": "AI Top Pick" | "Best Value" | "Eco Luxury" | "Budget Friendly",
    "icon": "🏰" | "🏨" | "🏡" | "🛏️",
    "description": "2-sentence engaging summary of location and highlights in ${destination}.",
    "locationHighlights": "Short sentence on location convenience e.g. 5 minutes from Ella town center.",
    "roomType": "Standard / Deluxe Room with Private Balcony"
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
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            responseMimeType: "application/json",
          },
        }),
        signal: AbortSignal.timeout(20000),
      });

      if (response.ok) {
        data = await response.json();
        console.log(`[GeminiHotelService] Successfully generated hotels using model: ${model}`);
        break;
      }

      const errorText = await response.text();
      lastError = new Error(`Model ${model} failed (${response.status}): ${errorText}`);

      // If temporary overload (503), rate limit (429), server error (500), or not found (404), try next model
      if ([503, 429, 500, 404].includes(response.status) || errorText.includes("demand") || errorText.includes("not found")) {
        console.warn(`[GeminiHotelService] Model ${model} returned ${response.status}. Trying next candidate model...`);
        continue;
      } else {
        throw lastError;
      }
    } catch (e) {
      lastError = e;
      console.warn(`[GeminiHotelService] Model ${model} failed (${e.message}). Trying next candidate model...`);
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

  // Parse JSON
  const cleaned = textOutput.replace(/```json/g, "").replace(/```/g, "").trim();
  const rawList = JSON.parse(cleaned);

  if (!Array.isArray(rawList) || rawList.length === 0) {
    throw new Error("Gemini returned invalid list format");
  }

  // Standardize results
  const standardized = rawList.map((hotel, index) => {
    const tier = ["Luxury", "Comfort", "Budget"].includes(hotel.tier) ? hotel.tier : "Comfort";
    const name = hotel.name || `Hotel in ${destination}`;
    return {
      id: hotel.id || `gemini-${destination.toLowerCase()}-${Date.now()}-${index}`,
      name,
      tier,
      pricePerNight: Number(hotel.pricePerNight) || 15000,
      rating: Number(hotel.rating) || 4.6,
      reviews: Number(hotel.reviews) || 200,
      amenities: Array.isArray(hotel.amenities) ? hotel.amenities : ["WiFi", "Breakfast", "AC", "Private Bathroom"],
      badge: hotel.badge || "✨ AI Recommendation",
      icon: hotel.icon || (tier === "Luxury" ? "🏰" : tier === "Budget" ? "🛏️" : "🏨"),
      description: hotel.description || `Beautiful stay in ${destination} matching your preferences.`,
      locationHighlights: hotel.locationHighlights || `Conveniently situated in ${destination} with easy transit access.`,
      roomType: hotel.roomType || "Deluxe Room",
      source: "gemini",
    };
  });

  // Enrich with authentic Wikimedia Commons / Wikipedia photography
  return await hotelImageService.enrichHotelsWithPhotos(standardized, destination);
}

module.exports = {
  fetchHotelsWithGemini,
};
