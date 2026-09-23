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

  const prompt = `You are an expert Sri Lankan culinary guide, food critic, and local dining specialist.
Generate exactly 3 or 4 real, authentic, well-known local food spots, legendary street food eateries, traditional rice & curry restaurants, or iconic dining spots in or immediately around "${destination}", Sri Lanka.

${excludeClause}Traveler Context:
- Destination: ${destination}, Sri Lanka
- Target Budget Context: ${budget ? `LKR ${budget}` : "Flexible"}

Requirements:
- Only suggest real, authentic, popular places loved by locals and travelers (e.g., Dewmini Roti Shop in Mirissa, Matey Hut in Ella, Muslim Hotel in Kandy, Lucky Fort in Galle, Ministry of Crab in Colombo, etc.).
- Include a variety of authentic dining styles:
  - 1 traditional claypot rice & curry eatery
  - 1 popular street food / kottu legend
  - 1 fresh seafood grill or regional specialty spot
  - 1 local tea lounge or viewpoint cafe
- Accurate price range in Sri Lankan Rupees (LKR) e.g., "LKR 600 - 1,200", "LKR 1,500 - 3,000", "LKR 2,500 - 5,000".
- Genuine ratings (between 4.5 and 4.9) and review counts.
- Exact specialty dish description (e.g. "Famous cheese & avocado roti with devilled chicken", "Traditional 10-curry banana leaf buffet with dhal & pol sambol").
- Specific street, landmark, or area in ${destination}.
- 1-sentence tip on why to visit or best time to go.

You MUST reply with ONLY a raw JSON array containing 3 or 4 objects. Do not include markdown codeblocks or other text.

JSON format:
[
  {
    "id": "slug-string",
    "name": "Exact Restaurant Name in ${destination}",
    "type": "Rice & Curry" | "Roti & Kottu" | "Seafood Grill" | "Street Food Legend" | "Traditional Ceylon" | "Cafe & Bakery",
    "icon": "🍛" | "🍲" | "🦀" | "🥘" | "☕",
    "specialty": "Exact signature dish description",
    "priceRange": "LKR 800 - 1,500",
    "rating": 4.8,
    "reviews": 320,
    "badge": "Must-Try Legend" | "Top Rated" | "Hidden Gem" | "Local Favorite" | "Best Value",
    "location": "Street, area, or landmark in ${destination}",
    "whyVisit": "1-sentence tip on why it is special or best time to visit."
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
        console.log(`[GeminiFoodService] Successfully generated food spots using model: ${model}`);
        break;
      }

      const errorText = await response.text();
      lastError = new Error(`Model ${model} failed (${response.status}): ${errorText}`);

      if ([503, 429, 500, 404].includes(response.status) || errorText.includes("demand") || errorText.includes("not found")) {
        console.warn(`[GeminiFoodService] Model ${model} returned ${response.status}. Trying next candidate model...`);
        continue;
      } else {
        throw lastError;
      }
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
      googleMapsUrl: `https://www.google.com/maps/search/${encodeURIComponent(`${name} ${destination} Sri Lanka`)}`,
      source: "gemini",
    };
  });
}

module.exports = {
  fetchFoodWithGemini,
};
