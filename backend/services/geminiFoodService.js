// Gemini AI Authentic Food & Dining Service Provider
// Generates accurate, destination-specific food spot recommendations using Google Gemini

async function fetchFoodWithGemini({ destination, budget, exclude = [] }) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in .env");
  }

  const excludeList = Array.isArray(exclude)
    ? exclude
    : (exclude || "").split(",").map((s) => s.trim()).filter(Boolean);

  const excludeClause = excludeList.length > 0
    ? `CRITICAL EXCLUSION: Do NOT include any of the following eateries: ${excludeList.join(", ")}.\n`
    : "";

  const prompt = `You are a Sri Lanka culinary expert and food critic with deep knowledge of real restaurants, eateries, and street food spots across every city and region in Sri Lanka.
Generate exactly 3 or 4 REAL, authentic, well-known local food spots, famous street food eateries, traditional restaurants, or iconic dining spots that ACTUALLY EXIST in or immediately around "${destination}", Sri Lanka.

${excludeClause}Traveler Context:
- Destination: ${destination}, Sri Lanka
- Budget Context: ${budget ? `LKR ${budget}` : "Flexible"}

Requirements:
- Only suggest REAL, authentic places that genuinely exist in ${destination}, Sri Lanka and are loved by locals and travelers.
- Include a variety:
  - 1 traditional Sri Lankan rice & curry restaurant
  - 1 popular street food or casual eatery
  - 1 specialty dining spot (seafood, regional specialty)
  - 1 local cafe or dessert spot
- Prices in Sri Lankan Rupees (LKR), e.g. "LKR 300 - 800".
- Genuine ratings (4.5–4.9) and realistic review counts.
- Exact signature dish with a real description.
- Specific street, landmark, or area in ${destination}, Sri Lanka.

You MUST reply with ONLY a raw JSON array of 3 or 4 objects. No markdown, no explanation.

JSON format:
[
  {
    "id": "slug-string",
    "name": "Exact Real Restaurant Name",
    "type": "Traditional Restaurant" | "Street Food" | "Seafood" | "Cafe & Bakery" | "Fine Dining" | "Local Eatery",
    "icon": "🍛" | "🍲" | "🦞" | "☕",
    "specialty": "Exact signature dish description",
    "priceRange": "LKR 300 - 800",
    "rating": 4.8,
    "reviews": 320,
    "badge": "Must-Try Legend" | "Top Rated" | "Hidden Gem" | "Local Favorite" | "Best Value",
    "location": "Street, area, or landmark in ${destination}, Sri Lanka",
    "whyVisit": "1-sentence tip on why it is special or best time to visit."
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
        console.log(`[GeminiFoodService] Successfully generated food spots using model: ${model}`);
        break;
      }

      const errorText = await response.text();
      lastError = new Error(`Model ${model} failed (${response.status}): ${errorText.slice(0, 200)}`);
      console.warn(`[GeminiFoodService] Model ${model} returned ${response.status}. Trying next candidate model...`);
      continue;
    } catch (e) {
      lastError = e;
      console.warn(`[GeminiFoodService] Model ${model} failed (${e.message}). Trying next candidate model...`);
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

  return rawList.map((food, index) => {
    const name = food.name || `Authentic Eatery in ${destination}`;
    return {
      id: food.id || `gemini-food-${destination.toLowerCase()}-${Date.now()}-${index}`,
      name,
      type: food.type || "Rice & Curry",
      icon: food.icon || "🍛",
      specialty: food.specialty || "Authentic Sri Lankan local specialties & curries.",
      priceRange: food.priceRange || "LKR 1,000 - 2,000",
      rating: Number(food.rating) || 4.7,
      reviews: Number(food.reviews) || 250,
      badge: food.badge || "Local Favorite",
      location: food.location || `Central ${destination}`,
      whyVisit: food.whyVisit || "A celebrated culinary stop offering fresh, authentic Sri Lankan flavor.",
      googleMapsUrl: `https://www.google.com/maps/search/${encodeURIComponent(`${name} ${destination}`)}`,
      source: "gemini",
    };
  });
}

module.exports = {
  fetchFoodWithGemini,
};
