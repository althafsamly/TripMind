// Gemini AI Voice Trip Planning Parser Service
// Parses natural language and voice transcripts into structured trip parameters

const SRI_LANKA_DESTINATIONS = [
  "Ella",
  "Kandy",
  "Galle",
  "Mirissa",
  "Sigiriya",
  "Nuwara Eliya",
  "Colombo",
  "Trincomalee",
  "Bentota",
  "Ahangama",
  "Weligama",
  "Hiriketiya",
  "Yala",
  "Jaffna",
  "Anuradhapura",
  "Polonnaruwa",
  "Dambulla",
  "Negombo",
  "Tangalle",
  "Unawatuna",
  "Hikkaduwa",
  "Pasikudah",
  "Nilaveli",
  "Kalpitiya",
  "Hatton",
];

// Local Regex Fallback Parser for instant offline parsing
function localVoiceParser(transcript = "", baseDateStr) {
  const text = transcript.toLowerCase();
  const baseDate = baseDateStr ? new Date(baseDateStr) : new Date();

  // 1. Destination Match
  let destination = "Ella";
  for (const dest of SRI_LANKA_DESTINATIONS) {
    if (text.includes(dest.toLowerCase())) {
      destination = dest;
      break;
    }
  }

  // 2. Budget Match
  let budget = 60000;
  const lakhMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|lac|lacs)/i);
  if (lakhMatch) {
    budget = Math.round(parseFloat(lakhMatch[1]) * 100000);
  } else {
    const kMatch = text.match(/(\d+(?:\.\d+)?)\s*k\b/i);
    if (kMatch) {
      budget = Math.round(parseFloat(kMatch[1]) * 1000);
    } else {
      const thousandMatch = text.match(/(\d+)\s*(?:thousand|k)/i);
      if (thousandMatch) {
        budget = parseInt(thousandMatch[1], 10) * 1000;
      } else {
        const numMatch = text.match(/(?:budget\s*(?:is|of)?\s*)?(\d{4,7})/i);
        if (numMatch) {
          budget = parseInt(numMatch[1], 10);
        }
      }
    }
  }

  // 3. Trip Type & Group Size
  let tripType = "Solo";
  let groupSize = 1;

  if (
    text.includes("girlfriend") ||
    text.includes("boyfriend") ||
    text.includes("wife") ||
    text.includes("husband") ||
    text.includes("partner") ||
    text.includes("couple") ||
    text.includes("romantic") ||
    text.includes("honeymoon")
  ) {
    tripType = "Couple";
    groupSize = 2;
  } else if (text.includes("family") || text.includes("kids") || text.includes("parents")) {
    tripType = "Family";
    const famCount = text.match(/(\d+)\s*(?:people|members|persons)/);
    groupSize = famCount ? Math.max(3, parseInt(famCount[1], 10)) : 4;
  } else if (text.includes("friend") || text.includes("friends") || text.includes("group") || text.includes("buddies")) {
    tripType = "Friends";
    const groupCount = text.match(/(\d+)\s*(?:people|friends|members|persons)/);
    groupSize = groupCount ? Math.max(3, parseInt(groupCount[1], 10)) : 4;
  } else if (text.includes("solo") || text.includes("alone") || text.includes("myself")) {
    tripType = "Solo";
    groupSize = 1;
  }

  // 4. Duration & Dates
  let days = 3;
  const daysMatch = text.match(/(\d+)\s*(?:day|days)/i);
  const nightsMatch = text.match(/(\d+)\s*(?:night|nights)/i);
  if (daysMatch) {
    days = parseInt(daysMatch[1], 10);
  } else if (nightsMatch) {
    days = parseInt(nightsMatch[1], 10) + 1;
  } else if (text.includes("weekend")) {
    days = 2;
  } else if (text.includes("week")) {
    days = 7;
  }

  days = Math.max(1, Math.min(14, days));

  // Determine Start Date
  const start = new Date(baseDate);
  if (text.includes("tomorrow")) {
    start.setDate(start.getDate() + 1);
  } else if (text.includes("next week")) {
    start.setDate(start.getDate() + 7);
  } else if (text.includes("next monday")) {
    const day = start.getDay();
    const diff = (8 - day) % 7 || 7;
    start.setDate(start.getDate() + diff);
  } else if (text.includes("friday") || text.includes("this weekend")) {
    const day = start.getDay();
    const diff = (5 - day + 7) % 7 || 7;
    start.setDate(start.getDate() + diff);
  } else {
    start.setDate(start.getDate() + 3);
  }

  const end = new Date(start);
  end.setDate(start.getDate() + days - 1);

  const startDateStr = start.toISOString().split("T")[0];
  const endDateStr = end.toISOString().split("T")[0];

  return {
    destination,
    startDate: startDateStr,
    endDate: endDateStr,
    days,
    budget,
    tripType,
    groupSize,
    summary: `${destination} • ${days} Day${days > 1 ? "s" : ""} • ${tripType} • LKR ${budget.toLocaleString()}`,
    voiceConfirmation: `I've planned your ${days}-day ${tripType.toLowerCase()} trip to ${destination} with a budget of ${budget.toLocaleString()} rupees.`,
    provider: "local-parser",
  };
}

// Parse transcript using Gemini AI with fallback
async function parseVoiceTripWithGemini({ transcript, currentDate }) {
  if (!transcript || typeof transcript !== "string" || transcript.trim().length === 0) {
    throw new Error("Transcript text is required");
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const todayStr = currentDate || new Date().toISOString().split("T")[0];

  if (!apiKey) {
    console.log("[GeminiVoiceService] GEMINI_API_KEY missing, using local parser");
    return localVoiceParser(transcript, todayStr);
  }

  const prompt = `You are TripMind AI, an intelligent Sri Lankan travel planning voice assistant.
Today's Date: ${todayStr} (YYYY-MM-DD).

Analyze this spoken trip planning instruction from a traveler:
"${transcript}"

Extract the trip parameters into structured JSON:
1. "destination": The Sri Lankan destination (e.g., "Ella", "Kandy", "Galle", "Mirissa", "Sigiriya", "Nuwara Eliya", "Colombo", "Bentota", "Trincomalee", "Yala", "Ahangama", "Weligama", "Jaffna", etc.). If not mentioned, pick the best Sri Lankan highlight (e.g. "Ella").
2. "startDate": Exact start date in "YYYY-MM-DD" format. Calculate accurately based on today (${todayStr}), understanding "tomorrow", "this weekend", "next Monday", "in 2 weeks", or month names. Default to 2 days after today if unspecified.
3. "endDate": Exact end date in "YYYY-MM-DD" format. Calculated from the duration (e.g. 3 days means end date = startDate + 2 days).
4. "days": Total number of days as an integer (1-14).
5. "budget": Total budget in Sri Lankan Rupees (LKR) as a positive number. Understand "80k" -> 80000, "1 lakh" -> 100000, "150 thousand" -> 150000. If missing, default to 65000.
6. "tripType": One of exactly: "Solo" | "Couple" | "Family" | "Friends". ("with my girlfriend/boyfriend/husband/wife" = "Couple", "with kids/parents/family" = "Family", "with friends/group" = "Friends", "by myself/solo" = "Solo").
7. "groupSize": Integer number of people (Solo = 1, Couple = 2, Family = 3-6, Friends = 3-8).
8. "summary": Brief high-level summary e.g. "Ella • 3 Days • Couple • LKR 75,000".
9. "voiceConfirmation": Natural conversational one-sentence confirmation to speak to the traveler e.g. "Got it! Setting up a 3-day couple adventure in Ella with an LKR 75,000 budget."

Respond ONLY with a valid JSON object matching this structure. Do not use markdown blocks or other text.

JSON format:
{
  "destination": "Ella",
  "startDate": "2026-09-12",
  "endDate": "2026-09-14",
  "days": 3,
  "budget": 75000,
  "tripType": "Couple",
  "groupSize": 2,
  "summary": "Ella • 3 Days • Couple • LKR 75,000",
  "voiceConfirmation": "Got it! Setting up a 3-day couple adventure in Ella with an LKR 75,000 budget."
}`;

  const candidateModels = [
    ...new Set([
      process.env.GEMINI_MODEL,
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
        signal: AbortSignal.timeout(20000),
      });

      if (response.ok) {
        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = JSON.parse(rawText.trim());
          if (parsed.destination && parsed.startDate && parsed.budget) {
            console.log(`[GeminiVoiceService] Successfully parsed voice input with model: ${model}`);
            return {
              ...parsed,
              provider: "gemini",
            };
          }
        }
      }
    } catch (err) {
      console.warn(`[GeminiVoiceService] Model ${model} failed (${err.message}). Trying next...`);
    }
  }

  // Fallback to local regex parser
  console.log("[GeminiVoiceService] All Gemini models failed or timed out. Using local parser fallback.");
  return localVoiceParser(transcript, todayStr);
}

module.exports = {
  parseVoiceTripWithGemini,
  localVoiceParser,
  SRI_LANKA_DESTINATIONS,
};
