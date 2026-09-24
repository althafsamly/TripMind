// Gemini AI Weather, Disaster & Seasonal Advisory Service for Sri Lanka
// Evaluates real-time weather risks, monsoons, floodings, and off-season conditions

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Helper to resolve month number (1-12 or 01-12) to full month name
function getMonthNameFromDate(dateStr) {
  if (!dateStr) return "";
  const parts = String(dateStr).trim().split("-");
  if (parts.length >= 2) {
    const monthNum = parseInt(parts[1], 10);
    if (monthNum >= 1 && monthNum <= 12) {
      return MONTH_NAMES[monthNum - 1];
    }
  }
  return "";
}

// Local Curated Knowledge Fallback for Sri Lankan Seasonal Climates & Monsoons
function getLocalWeatherFallback({ destination, monthName, startDate, endDate }) {
  const destLower = (destination || "").toLowerCase().trim();
  const monthLower = (monthName || "").toLowerCase().trim();

  const isSouthWestCoast = [
    "mirissa",
    "galle",
    "bentota",
    "weligama",
    "ahangama",
    "hikkaduwa",
    "tangalle",
    "colombo",
    "negombo",
    "unawatuna",
    "hiriketiya",
  ].some((d) => destLower.includes(d));

  const isEastCoast = [
    "trincomalee",
    "nilaveli",
    "pasikudah",
    "arugam bay",
    "batticaloa",
    "jaffna",
  ].some((d) => destLower.includes(d));

  const isHighlands = [
    "ella",
    "nuwara eliya",
    "kandy",
    "hatton",
    "badulla",
    "horton plains",
  ].some((d) => destLower.includes(d));

  const isCulturalTriangle = [
    "sigiriya",
    "dambulla",
    "anuradhapura",
    "polonnaruwa",
  ].some((d) => destLower.includes(d));

  // 1. Southwest Monsoon (May to September): South & West coasts face heavy rain & rough seas
  const isSouthwestMonsoonMonth = [
    "may",
    "june",
    "july",
    "august",
    "september",
  ].some((m) => monthLower.includes(m));

  // 2. Northeast Monsoon (October/November to February): East & North coasts face heavy rains & storms
  const isNortheastMonsoonMonth = [
    "october",
    "november",
    "december",
    "january",
    "february",
  ].some((m) => monthLower.includes(m));

  // 3. Inter-Monsoon (October to November): Central hill country faces heavy afternoon downpours & landslides
  const isInterMonsoonMonth = ["october", "november"].some((m) =>
    monthLower.includes(m)
  );

  if (isSouthWestCoast && isSouthwestMonsoonMonth) {
    return {
      destination,
      monthName,
      hasAdvisory: true,
      level: "warning",
      badge: "Off-Season & Monsoon Alert",
      headline: `Southwest Monsoon Season in ${destination}`,
      season: "Southwest Monsoon (Yala Season)",
      summary: `${destination} experiences the Southwest monsoon during ${monthName}. Expect frequent heavy tropical downpours, strong winds, and rough ocean swells with red flags on beaches.`,
      risks: [
        "Rough sea conditions with dangerous currents; swimming and boat excursions may be suspended.",
        "Frequent heavy rain and intermittent thunderstorm disruptions.",
        "Many beachfront seasonal cafes and surf schools operate on reduced hours.",
      ],
      suggestedAlternates: [
        {
          destination: "Trincomalee",
          region: "East Coast",
          reason: `Peak dry season during ${monthName} with calm, crystal-clear turquoise waters and excellent snorkeling.`,
          bestFor: "Beach & Ocean Recreation",
        },
        {
          destination: "Sigiriya",
          region: "Cultural Triangle",
          reason: `Sheltered from the Southwest monsoon with warm, mostly dry days ideal for rock climbing and ancient sightseeing.`,
          bestFor: "Culture & Sightseeing",
        },
        {
          destination: "Pasikudah",
          region: "East Coast",
          reason: `Shallow, calm waters and sunny coastal weather throughout ${monthName}.`,
          bestFor: "Swimming & Relaxation",
        },
      ],
      provider: "curated-fallback",
    };
  }

  if (isEastCoast && isNortheastMonsoonMonth) {
    return {
      destination,
      monthName,
      hasAdvisory: true,
      level: "warning",
      badge: "Monsoon Weather Advisory",
      headline: `Northeast Monsoon Heavy Rainfall in ${destination}`,
      season: "Northeast Monsoon (Maha Season)",
      summary: `${destination} receives substantial rainfall and stormy coastal weather from the Northeast monsoon in ${monthName}. Marine tours and diving are generally closed.`,
      risks: [
        "Heavy monsoon rains and overcast skies affecting outdoor activities.",
        "Rough ocean conditions with high waves along the eastern coastline.",
        "Limited visibility for diving, snorkeling, and boat safaris.",
      ],
      suggestedAlternates: [
        {
          destination: "Mirissa",
          region: "South Coast",
          reason: `Sunny peak season in ${monthName} with calm waters, ideal for whale watching and beach relaxation.`,
          bestFor: "Beaches & Marine Life",
        },
        {
          destination: "Galle",
          region: "South Coast",
          reason: `Dry, pleasant coastal weather with vibrant dining and historic fort exploration.`,
          bestFor: "Heritage & Coastal Leisure",
        },
        {
          destination: "Bentota",
          region: "West Coast",
          reason: `Calm golden sands and active water sport centers during this period.`,
          bestFor: "Water Sports & Resorts",
        },
      ],
      provider: "curated-fallback",
    };
  }

  if (isHighlands && isInterMonsoonMonth) {
    return {
      destination,
      monthName,
      hasAdvisory: true,
      level: "warning",
      badge: "Rainfall & Trekking Advisory",
      headline: `Heavy Afternoon Showers & Mist in ${destination}`,
      season: "Inter-Monsoon Rainy Period",
      summary: `${destination} experiences frequent afternoon downpours and thick mist during ${monthName}. Hiking trails can become slippery and mountain roads require careful driving.`,
      risks: [
        "Slippery trails and leech presence during mountain hikes.",
        "Reduced panoramic views at Ella Rock or Little Adam's Peak due to dense fog.",
        "Afternoon thunderstorm downpours and localized water runoff.",
      ],
      suggestedAlternates: [
        {
          destination: "Sigiriya",
          region: "Cultural Triangle",
          reason: `Drier ground conditions and clearer weather for outdoor monument visits during ${monthName}.`,
          bestFor: "Outdoor Sightseeing",
        },
        {
          destination: "Galle",
          region: "South Coast",
          reason: `Mild coastal climate with numerous indoor cultural stops, boutiques, and sheltered cafes.`,
          bestFor: "Walkable Heritage Exploration",
        },
      ],
      provider: "curated-fallback",
    };
  }

  // Favorable weather
  return {
    destination,
    monthName,
    hasAdvisory: false,
    level: "favorable",
    badge: "Favorable Travel Weather",
    headline: `Favorable Weather Conditions in ${destination}`,
    season: "Optimal Travel Season",
    summary: `${destination} generally enjoys favorable travel weather in ${monthName}. Good conditions for sightseeing, outdoor activities, and comfortable travel.`,
    risks: [],
    suggestedAlternates: [],
    provider: "curated-fallback",
  };
}

// Generate weather, disaster & seasonal advisory using Gemini AI with fallback
async function getWeatherAdvisoryWithGemini({
  destination,
  startDate,
  endDate,
  startMonth,
  endMonth,
  monthName,
}) {
  if (!destination || !startDate || !endDate) {
    throw new Error("destination, startDate, and endDate are required");
  }

  // Ensure month names are converted if not provided
  const resolvedStartMonth = startMonth || getMonthNameFromDate(startDate);
  const resolvedEndMonth = endMonth || getMonthNameFromDate(endDate);
  const resolvedMonthName =
    monthName ||
    (resolvedStartMonth === resolvedEndMonth
      ? resolvedStartMonth
      : `${resolvedStartMonth} to ${resolvedEndMonth}`);

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.log(
      "[GeminiWeatherService] GEMINI_API_KEY missing, using local curated fallback"
    );
    return getLocalWeatherFallback({
      destination,
      monthName: resolvedMonthName,
      startDate,
      endDate,
    });
  }

  const prompt = `You are TripMind Weather & Climate Advisory Specialist for Sri Lanka.
Analyze the weather, seasonal climate, monsoon patterns, rainfall, flooding risk, and sea conditions for travelers.

Travel Parameters:
- Destination: "${destination}", Sri Lanka
- Dates: ${startDate} to ${endDate}
- Month of Travel: "${resolvedMonthName}" (Start Month: "${resolvedStartMonth}", End Month: "${resolvedEndMonth}")

Context on Sri Lanka Monsoons & Climate:
1. Southwest Monsoon (Yala) - May to September: Heavy rainfall, rough seas, high surf, red flag beach warnings on the South & West coasts (Mirissa, Galle, Bentota, Weligama, Colombo, Hikkaduwa). During this period, the East Coast (Trincomalee, Pasikudah, Arugam Bay) has sunny, calm waters and is in peak season.
2. Northeast Monsoon (Maha) - October/November to February: Heavy rainfall, rough seas, and storms on the East and North coasts (Trincomalee, Pasikudah, Jaffna). During this period, the South & West coasts (Mirissa, Galle, Bentota) are in their sunny, calm peak season.
3. Inter-Monsoon Periods - October-November and March-April: Island-wide afternoon thunderstorms and heavy rain. The Hill Country (Ella, Nuwara Eliya, Kandy) has slippery trails, leeches, mist, and potential landslide/mud hazards on mountain roads.
4. Flooding / Natural Disasters: If any area is prone to severe river flooding, waterlogging, or severe weather disruption during "${resolvedMonthName}", warn the traveler clearly.

Evaluate "${destination}" during "${resolvedMonthName}":
- If the destination is facing off-season conditions, monsoon rains, flooding/landslide risk, rough seas, or severe adverse weather:
  - "hasAdvisory": true
  - "level": "warning" (for off-season, monsoon rains, rough seas, trekking hazards) OR "danger" (for active flooding/disaster hazard)
  - "badge": Short clean text without emojis e.g. "Monsoon Off-Season Alert" or "Heavy Rainfall Precaution" or "Adverse Weather Notice"
  - "headline": Informative title e.g. "Southwest Monsoon Off-Season in Mirissa" or "Heavy Rainfall & Rough Seas in Trincomalee"
  - "season": Name of the climatic phase e.g. "Southwest Monsoon Season"
  - "summary": 2-3 objective, professional sentences explaining why this month is off-season or hazardous, and what travelers will face.
  - "risks": Array of 2-3 specific risks (e.g. ["Red flags on beaches due to strong undercurrents and high waves", "Daily heavy afternoon downpours and low cloud cover", "Closed water sports and boat excursions"]).
  - "suggestedAlternates": Array of 2-3 alternate Sri Lankan destinations where the weather is sunny, dry, or significantly better during "${resolvedMonthName}". For each alternate provide:
    - "destination": Name of the alternate city/town in Sri Lanka (e.g. "Trincomalee", "Sigiriya", "Mirissa")
    - "region": e.g. "East Coast" or "Cultural Triangle"
    - "reason": Clear reason why the weather is great there in "${resolvedMonthName}"
    - "bestFor": 2-3 words (e.g. "Beach & Snorkeling", "Rock Fortress Sightseeing")

- If conditions are favorable, sunny, dry, or generally good:
  - "hasAdvisory": false
  - "level": "favorable"
  - "badge": "Favorable Travel Weather"
  - "headline": "Favorable Weather Expected in ${destination}"
  - "season": "Optimal Travel Season"
  - "summary": 2 sentences explaining why "${resolvedMonthName}" is a good time to visit.
  - "risks": []
  - "suggestedAlternates": []

Rules:
- Do NOT use unnecessary emojis in the text.
- Output ONLY valid JSON matching the format below. Do not wrap in markdown or backticks.

JSON format:
{
  "hasAdvisory": true,
  "level": "warning",
  "badge": "Monsoon Off-Season Alert",
  "headline": "Southwest Monsoon Showers & Rough Seas in Mirissa",
  "season": "Southwest Monsoon Season",
  "summary": "Mirissa is in its off-season during ${resolvedMonthName} due to the Southwest monsoon. Ocean currents are turbulent with red flag swimming warnings, and frequent heavy showers occur.",
  "risks": [
    "Dangerous swimming conditions and rough waves along Mirissa beach",
    "Whale watching and boat safaris are frequently cancelled",
    "Afternoon and evening tropical rainstorms"
  ],
  "suggestedAlternates": [
    {
      "destination": "Trincomalee",
      "region": "East Coast",
      "reason": "Enjoying sunny peak season in ${resolvedMonthName} with calm, transparent seas ideal for swimming and snorkeling.",
      "bestFor": "Beaches & Water Sports"
    },
    {
      "destination": "Sigiriya",
      "region": "Cultural Triangle",
      "reason": "Generally warm and dry weather, ideal for morning climbs up Lion Rock and Pidurangala.",
      "bestFor": "Culture & Hiking"
    }
  ]
}`;

  const candidateModels = [
    ...new Set([
      process.env.GEMINI_MODEL,
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-1.5-flash",
      "gemini-3.6-flash",
      "gemini-3.5-flash-lite",
      "gemini-3.7-flash",
      "gemini-3.5-flash",
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
            temperature: 0.2,
            responseMimeType: "application/json",
          },
        }),
        signal: AbortSignal.timeout(18000),
      });

      if (response.ok) {
        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = JSON.parse(rawText.trim());
          if (typeof parsed.hasAdvisory === "boolean") {
            console.log(
              `[GeminiWeatherService] Successfully generated advisory with model ${model} for ${destination} in ${resolvedMonthName}`
            );
            return {
              ...parsed,
              destination,
              monthName: resolvedMonthName,
              startDate,
              endDate,
              provider: "gemini",
            };
          }
        }
      }
    } catch (err) {
      console.warn(
        `[GeminiWeatherService] Model ${model} failed (${err.message}). Trying next...`
      );
    }
  }

  console.log(
    "[GeminiWeatherService] All Gemini models failed or timed out. Using local curated fallback."
  );
  return getLocalWeatherFallback({
    destination,
    monthName: resolvedMonthName,
    startDate,
    endDate,
  });
}

module.exports = {
  getWeatherAdvisoryWithGemini,
  getLocalWeatherFallback,
  getMonthNameFromDate,
  MONTH_NAMES,
};
