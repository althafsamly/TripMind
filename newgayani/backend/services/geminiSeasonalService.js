// Gemini AI Seasonal Travel Recommendations Service
// Dynamically analyzes Sri Lankan monsoon and weather cycles for specific travel dates

// Local Seasonal Heuristics Fallback (Used if Gemini AI is unavailable or rate-limited)
function getLocalSeasonalFallback(dateStr) {
  const date = dateStr ? new Date(dateStr) : new Date();
  const month = !isNaN(date.getTime()) ? date.getMonth() + 1 : 1;

  if (month === 12 || month <= 4) {
    return {
      seasonBadge: "South & West Coast Dry Season (Top Travel Months)",
      weatherHint: "Calm turquoise seas, prime whale watching & sunny hill country views.",
      destinations: [
        { name: "Mirissa", tag: "Beach & Whales", desc: "Whale watching, surfing & sunset beach nightlife" },
        { name: "Galle", tag: "Heritage & Coast", desc: "Historic Dutch Fort, boutique cafes & tranquil bays" },
        { name: "Ella", tag: "Hill Country", desc: "Nine Arch Bridge, mountain hikes & tea plantation trails" },
        { name: "Weligama", tag: "Surf & Chill", desc: "Consistent surf breaks, sandy bays & beach cafes" },
      ],
      provider: "catalog",
    };
  }

  if (month >= 5 && month <= 9) {
    return {
      seasonBadge: "East Coast Sunny Season & Cultural Triangle",
      weatherHint: "Crystal-clear calm waters in the East and dry, sunny weather for heritage sites.",
      destinations: [
        { name: "Trincomalee", tag: "Clear Water & Snorkel", desc: "Nilaveli beach, Pigeon Island marine park & calm seas" },
        { name: "Sigiriya", tag: "Ancient Wonder", desc: "Lion Rock fortress, Pidurangala & dry sunny skies" },
        { name: "Dambulla", tag: "Heritage & Wildlife", desc: "Cave temples, safari parks & cultural triangle routes" },
        { name: "Jaffna", tag: "Peninsula & Culture", desc: "Nallur Kandaswamy temple, causeways & authentic food" },
      ],
      provider: "catalog",
    };
  }

  return {
    seasonBadge: "Central Highlands & Cultural Heritage",
    weatherHint: "Misty tea hills, lush green landscapes & vibrant cultural landmarks.",
    destinations: [
      { name: "Kandy", tag: "Cultural Capital", desc: "Temple of the Tooth, royal botanical gardens & misty lake" },
      { name: "Nuwara Eliya", tag: "Little England", desc: "Cool mountain climate, tea estates & colonial bungalows" },
      { name: "Sigiriya", tag: "Heritage & Nature", desc: "Ancient rock citadel with lush surrounding landscapes" },
      { name: "Colombo", tag: "City & Flavors", desc: "Galle Face Green, artisanal dining, shopping & museums" },
    ],
    provider: "catalog",
  };
}

/**
 * Generate AI-powered seasonal recommendations using Google Gemini
 * @param {Object} options
 * @param {string} options.startDate - e.g. "2026-09-15"
 * @param {string} options.endDate - e.g. "2026-09-22"
 */
async function fetchSeasonalRecommendationsWithGemini({ startDate, endDate }) {
  if (!startDate) {
    return getLocalSeasonalFallback(null);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log("[GeminiSeasonalService] GEMINI_API_KEY missing, using local fallback");
    return getLocalSeasonalFallback(startDate);
  }

  const prompt = `You are TripMind AI, an expert Sri Lankan meteorologist and smart travel advisor.
A traveler has selected the following travel dates:
- Travel Start Date: ${startDate}
- Travel End Date: ${endDate || "Same week"}

Analyze the exact monsoon season, weather patterns, coastal sea calmness, and rainfall distribution in Sri Lanka for this specific time of year (understanding Southwest Monsoon vs Northeast Monsoon vs Inter-monsoons).

Recommend exactly 4 of the BEST destinations in Sri Lanka to travel to during this specific date window.

Requirements:
- "seasonBadge": A concise, professional title for the active season during these dates (e.g. "East Coast Sunny Season & Cultural Triangle" or "South & West Coast Dry Season (Top Travel Months)"). STRICT RULE: Do NOT include any emojis.
- "weatherHint": A clear, accurate 1-sentence meteorological reason explaining why these regions have ideal weather during this period. STRICT RULE: Do NOT include any emojis.
- "destinations": An array of exactly 4 distinct Sri Lankan travel destinations (cities/regions):
  - "name": Exact destination name (e.g. "Trincomalee", "Sigiriya", "Ella", "Mirissa", "Kandy", "Jaffna", "Nuwara Eliya", "Galle", "Dambulla", "Colombo", etc.)
  - "tag": Short 2-3 word highlight (e.g. "Clear Water & Snorkeling", "Ancient Rock Fortress", "Hill Country Trails", "Surf & Coastal Cafes"). STRICT RULE: Do NOT include emojis.
  - "desc": 1 engaging, authentic sentence detailing why this spot is prime to visit during these specific travel dates.

You MUST reply with ONLY a raw JSON object matching this schema. Do not use markdown blocks, do not include explanations.

JSON format:
{
  "seasonBadge": "East Coast Sunny Season & Cultural Triangle",
  "weatherHint": "Crystal-clear calm waters in the East and dry sunny weather for cultural triangle explorations.",
  "destinations": [
    {
      "name": "Trincomalee",
      "tag": "Clear Water & Snorkeling",
      "desc": "Nilaveli beach, Pigeon Island marine park & calm seas perfect for swimming and diving."
    },
    {
      "name": "Sigiriya",
      "tag": "Ancient Fortress",
      "desc": "Dry sunny weather makes climbing the Lion Rock and exploring Pidurangala comfortable."
    },
    {
      "name": "Dambulla",
      "tag": "Cave Temples & Safari",
      "desc": "Pleasant conditions for visiting the historic cave temples and nearby Minneriya elephant safaris."
    },
    {
      "name": "Jaffna",
      "tag": "Peninsula & Culture",
      "desc": "Sunny northern skies, vibrant Hindu architecture, causeways, and authentic regional cuisine."
    }
  ]
}`;

  const candidateModels = [
    ...new Set([
      process.env.GEMINI_MODEL,
      "gemini-3.6-flash",
      "gemini-3.5-flash-lite",
      "gemini-3.7-flash",
      "gemini-3.5-flash",
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-1.5-flash",
    ].filter(Boolean)),
  ];

  for (const model of candidateModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            responseMimeType: "application/json",
          },
        }),
        signal: AbortSignal.timeout(15000),
      });

      if (response.ok) {
        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          // Clean possible markdown wrapper if model returns it
          const cleanedText = rawText.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
          const parsed = JSON.parse(cleanedText);

          if (parsed.seasonBadge && Array.isArray(parsed.destinations) && parsed.destinations.length >= 3) {
            console.log(`[GeminiSeasonalService] Successfully generated seasonal destinations via Gemini model: ${model}`);
            return {
              seasonBadge: parsed.seasonBadge,
              weatherHint: parsed.weatherHint || "Optimal travel weather and conditions across recommended regions.",
              destinations: parsed.destinations.slice(0, 4),
              provider: "gemini",
            };
          }
        }
      } else {
        const errorText = await response.text();
        console.warn(`[GeminiSeasonalService] Model ${model} returned ${response.status}: ${errorText.substring(0, 150)}`);
      }
    } catch (err) {
      console.warn(`[GeminiSeasonalService] Model ${model} request error (${err.message}). Trying next...`);
    }
  }

  console.log("[GeminiSeasonalService] All Gemini models failed or timed out. Falling back to local heuristics.");
  return getLocalSeasonalFallback(startDate);
}

module.exports = {
  fetchSeasonalRecommendationsWithGemini,
  getLocalSeasonalFallback,
};
