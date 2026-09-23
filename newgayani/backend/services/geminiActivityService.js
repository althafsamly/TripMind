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

  const prompt = `You are an expert Sri Lankan tour guide and destination specialist.
Generate exactly 6 real, well-known, authentic attractions, outdoor adventures, guided excursions, or cultural experiences in or immediately around "${destination}", Sri Lanka.

${excludeClause}Context:
- Destination: ${destination}, Sri Lanka
- Travel Group: ${travelers} traveler(s) (${tripType})
- Total Trip Budget: LKR ${budget}
- Preferences: ${categoryConstraint}

Requirements:
- Every activity must be a REAL, genuine attraction or experience located in or easily accessible from ${destination}.
- "cost": Realistic admission, ticket, park permit, or tour cost in Sri Lankan Rupees (LKR) per person. Use 0 for free attractions (e.g. public beaches, viewpoints, public hiking trails).
- "category": MUST be one of ["Sightseeing", "Adventure", "Hiking", "Culture", "Nature", "Beaches", "Food", "Wellness"].
- "timeSlot": MUST be one of ["Morning", "Afternoon", "Evening"].
- "duration": Realistic time (e.g. "2 hours", "3 hours", "Half Day", "1.5 hours").
- "highlight": One actionable insider tip for travelers (e.g. "Climb early at 7 AM to avoid sun exposure and lines", "Cover shoulders and knees for temple entry", "Pre-book blue train tickets in advance").
- "location": Exact landmark, village, or proximity.
- "imageTag": MUST be the most matching tag from: ["botanical_garden", "cultural_dance", "tooth_temple", "kandy_lake", "buddha_statue", "cave_temple", "sigiriya_rock", "pidurangala", "elephant_safari", "nine_arch", "whale_watching", "tea_plantation", "surfing", "zipline", "waterfall", "ayurveda_massage", "cooking_food", "temple", "galle_fort", "lighthouse", "coconut_hill", "snorkeling", "stilt_fishermen", "horton_plains", "hiking", "village_tour", "beach", "market"]. Choose the tag that visually depicts what travelers actually see or do in this activity.

You MUST reply with ONLY a raw JSON array containing exactly 6 objects. Do not include markdown codeblocks, do not include explanations.

JSON format:
[
  {
    "id": "slug-id",
    "title": "Exact Real Attraction or Activity Name",
    "category": "Sightseeing",
    "timeSlot": "Morning",
    "duration": "2.5 hours",
    "cost": 0,
    "icon": "🚂",
    "imageTag": "nine_arch",
    "description": "2-sentence engaging description of the activity and why it is special in ${destination}.",
    "highlight": "Essential insider tip on visiting hours, tickets, or etiquette.",
    "location": "Specific location or landmark in ${destination}"
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
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(20000),
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
