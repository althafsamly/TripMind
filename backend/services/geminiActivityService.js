// Gemini AI Activity Service Provider
// Generates accurate, destination-specific real activities and attractions using Google Gemini

const activityImageService = require("./activityImageService");

async function fetchActivitiesWithGemini({ destination, budget = 75000, tripType = "Solo", travelers = 1, category, exclude = [] }) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in .env");
  }

  const excludeList = Array.isArray(exclude)
    ? exclude
    : (exclude || "").split(",").map((s) => s.trim()).filter(Boolean);

  const excludeClause = excludeList.length > 0
    ? `CRITICAL EXCLUSION: Do NOT include any of the following activities (they are already displayed to the user): ${excludeList.join(", ")}. Suggest 6 DIFFERENT authentic real activities or attractions in or immediately around ${destination}.\n`
    : "";

  const categoryConstraint = category && category !== "All"
    ? `Focus especially on activities in the "${category}" category.`
    : "Provide a diverse, engaging mix across Sightseeing, Adventure, Hiking, Culture, Nature, Food, Beaches, and Wellness.";

  const prompt = `You are a Sri Lanka travel expert and destination specialist with deep knowledge of real attractions, activities, and experiences across every city and region in Sri Lanka.
Generate exactly 6 REAL, genuine, well-known attractions, outdoor adventures, guided excursions, or cultural experiences that ACTUALLY EXIST in or immediately around "${destination}", Sri Lanka.

${excludeClause}Context:
- Destination: ${destination}, Sri Lanka
- Travel Group: ${travelers} traveler(s) (${tripType})
- Total Trip Budget: LKR ${budget}
- Preferences: ${categoryConstraint}

Requirements:
- Every activity MUST be a REAL, genuine attraction or experience that actually exists in ${destination}, Sri Lanka. Do NOT invent places.
- "cost": Realistic admission or tour cost in Sri Lankan Rupees (LKR). Use 0 for free public attractions.
- "category": MUST be one of ["Sightseeing", "Adventure", "Hiking", "Culture", "Nature", "Beaches", "Food", "Wellness"].
- "timeSlot": MUST be one of ["Morning", "Afternoon", "Evening"].
- "duration": Realistic time (e.g. "2 hours", "3 hours", "Half Day").
- "highlight": One actionable insider tip (e.g. "Arrive early to beat the crowds").
- "location": Exact landmark, district, or neighborhood within ${destination}, Sri Lanka.
- "imageTag": MUST be one of: ["botanical_garden", "cultural_dance", "buddha_statue", "cave_temple", "elephant_safari", "whale_watching", "tea_plantation", "surfing", "zipline", "waterfall", "ayurveda_massage", "cooking_food", "temple", "lighthouse", "snorkeling", "hiking", "village_tour", "beach", "market", "museum", "castle", "city_tour", "art_gallery", "national_park", "mountain", "river_cruise", "street_food", "shopping"].

You MUST reply with ONLY a raw JSON array of exactly 6 objects. No markdown, no explanation.

JSON format:
[
  {
    "id": "slug-id",
    "title": "Exact Real Attraction or Activity Name",
    "category": "Sightseeing",
    "timeSlot": "Morning",
    "duration": "2.5 hours",
    "cost": 0,
    "icon": "🗺️",
    "imageTag": "city_tour",
    "description": "2-sentence description of the activity and why it is special in ${destination}.",
    "highlight": "Essential insider tip on visiting hours, tickets, or etiquette.",
    "location": "Specific location or landmark in ${destination}, Sri Lanka"
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
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(7000),
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
          },
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`[GeminiActivityService] Model ${model} returned HTTP ${response.status}. Trying next candidate model...`);
        lastError = new Error(`Model ${model} returned HTTP ${response.status}: ${errText.slice(0, 120)}`);
        continue;
      }

      data = await response.json();
      console.log(`[GeminiActivityService] Successfully generated activities using live model: ${model}`);
      break;
    } catch (err) {
      console.warn(`[GeminiActivityService] Model ${model} failed (${err.message}). Trying next candidate model...`);
      lastError = err;
      continue;
    }
  }

  if (!data) {
    throw lastError || new Error("Failed to receive a valid response from Gemini API");
  }

  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new Error("Empty text response from Gemini API");
  }

  // Parse JSON response safely
  let cleanedText = rawText.trim();
  if (cleanedText.startsWith("```json")) {
    cleanedText = cleanedText.slice(7);
  } else if (cleanedText.startsWith("```")) {
    cleanedText = cleanedText.slice(3);
  }
  if (cleanedText.endsWith("```")) {
    cleanedText = cleanedText.slice(0, -3);
  }
  cleanedText = cleanedText.trim();

  let activities = JSON.parse(cleanedText);
  if (!Array.isArray(activities) || activities.length === 0) {
    throw new Error("Gemini returned invalid activities format (expected non-empty JSON array)");
  }

  const validCategories = ["Sightseeing", "Adventure", "Hiking", "Culture", "Nature", "Beaches", "Food", "Wellness"];

  const mappedActivities = activities.slice(0, 8).map((act, index) => {
    const title = act.title || `Experience in ${destination}`;
    const category = validCategories.includes(act.category) ? act.category : "Sightseeing";
    const cost = Number(act.cost) >= 0 ? Number(act.cost) : 0;
    const timeSlot = ["Morning", "Afternoon", "Evening"].includes(act.timeSlot) ? act.timeSlot : "Morning";

    return {
      id: act.id || `gemini-act-${destination.toLowerCase()}-${Date.now()}-${index}`,
      title,
      category,
      timeSlot,
      duration: act.duration || "2 hours",
      cost,
      icon: act.icon || (category === "Hiking" ? "🥾" : category === "Adventure" ? "🦅" : category === "Culture" ? "🏛️" : category === "Beaches" ? "🌊" : "📍"),
      image: activityImageService.getActivityPhoto(title, act.description, category, act.imageTag),
      imageTag: act.imageTag || "",
      description: act.description || `Explore ${title} in ${destination}.`,
      highlight: act.highlight || `Recommended experience in ${destination}.`,
      location: act.location || `${destination}, Sri Lanka`,
      source: "gemini",
    };
  });

  return await activityImageService.enrichActivitiesWithPhotos(mappedActivities, destination);
}

module.exports = {
  fetchActivitiesWithGemini,
};
