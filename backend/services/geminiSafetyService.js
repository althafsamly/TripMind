// Gemini AI Emergency & Travel Safety Assistant Service for Sri Lanka
// Provides intelligent first-aid guidance, crisis assessment, and localized Sinhala communication phrases

const SRI_LANKA_REGIONAL_HOSPITALS = {
  colombo: "National Hospital of Sri Lanka (NHSL) - 011-2691111",
  kandy: "Kandy National Teaching Hospital - 081-2222261",
  galle: "Karapitiya National Teaching Hospital - 091-2232176",
  ella: "Badulla Provincial General Hospital - 055-2222261",
  mirissa: "Weligama Base Hospital / Matara General - 041-2250261",
  sigiriya: "Dambulla Base Hospital - 066-2284761",
  "nuwara eliya": "Nuwara Eliya District General Hospital - 052-2222261",
  trincomalee: "Trincomalee District General Hospital - 026-2222261",
  jaffna: "Jaffna Teaching Hospital - 021-2222261",
};

// Curated Emergency Fallback Database for common Sri Lankan tourist emergencies
function getLocalSafetyFallback({ query = "", destination = "Sri Lanka" }) {
  const q = query.toLowerCase();
  const dest = destination || "Sri Lanka";
  const hospital = SRI_LANKA_REGIONAL_HOSPITALS[dest.toLowerCase()] || "Nearest District Base Hospital or Dial 1990";

  // 1. Snake / Leech / Insect Bite
  if (q.includes("snake") || q.includes("viper") || q.includes("cobra")) {
    return {
      headline: `Emergency First-Aid: Suspected Snake Bite (${dest})`,
      urgencyLevel: "Critical",
      badge: "🚨 Immediate Emergency (Call 1990)",
      firstAidSteps: [
        "Keep the victim completely calm and still. Restrict movement to slow venom spread.",
        "Immobilize the bitten limb at or slightly below heart level with a splint or loose cloth.",
        "Do NOT cut the wound, do NOT attempt to suck venom, and do NOT apply a tight arterial tourniquet.",
        "Remove rings, watches, or tight clothing around the limb before swelling starts.",
        "Transport immediately to the nearest government hospital (Sri Lankan government hospitals have free anti-venom).",
      ],
      warnings: [
        "Do not apply ice, herbal pastes, or electric shocks.",
        "Take a safe photo of the snake if possible, but do not risk catching it.",
      ],
      hotline: "1990 Suwa Seriya Free Ambulance",
      nearestHospitalRecommendation: hospital,
      sinhalaPhrases: [
        {
          english: "Help, someone was bitten by a snake!",
          sinhala: "උදව් කරන්න, කෙනෙකුට සර්පයෙක් දෂ්ට කළා!",
          singlishPhonetics: "Udaw karanna, kenekuta sarpayek dashta kala!",
        },
        {
          english: "Please take us to the nearest government hospital immediately.",
          sinhala: "කරුණාකරලා අපිව ඉක්මනටම ළඟම රජයේ රෝහලට ගෙනියන්න.",
          singlishPhonetics: "Karunakarala apiwa ikmanatama langama rajaye rohalata geniyanna.",
        },
      ],
      provider: "curated-srilanka-safety-kb",
    };
  }

  // 2. Jellyfish / Sea Sting
  if (q.includes("jellyfish") || q.includes("sting") || q.includes("sea urchin") || q.includes("ocean")) {
    return {
      headline: `Marine First-Aid: Jellyfish / Marine Sting (${dest})`,
      urgencyLevel: "Urgent",
      badge: "🌊 Marine First-Aid Guidance",
      firstAidSteps: [
        "Carefully exit the water immediately to prevent drowning or fainting.",
        "Rinse the sting generously with SEA WATER (never use fresh tap water, as it triggers more venom release).",
        "If available at local beach cafes or lifeguard huts, rinse with domestic vinegar for 30 seconds.",
        "Gently pluck away visible tentacles using tweezers or the edge of a credit card; avoid bare hands.",
        "Immerse the affected area in hot water (as hot as tolerable) for 20-40 minutes to relieve pain.",
      ],
      warnings: [
        "Never rub the sting with sand, towel, or hands.",
        "If experiencing shortness of breath or throat tightness, dial 1990 immediately.",
      ],
      hotline: "1990 National Ambulance / 011-2421052 Tourist Police",
      nearestHospitalRecommendation: hospital,
      sinhalaPhrases: [
        {
          english: "A jellyfish stung me, I need medical help.",
          sinhala: "මට ජෙලිෆිෂ් කෙනෙක් විද්දා, මට වෛද්‍ය උදව් ඕනෙ.",
          singlishPhonetics: "Mata jellyfish kenek widda, mata waidya udaw one.",
        },
      ],
      provider: "curated-srilanka-safety-kb",
    };
  }

  // 3. Road / Bike Accident
  if (q.includes("accident") || q.includes("bike") || q.includes("scooter") || q.includes("crash") || q.includes("fall")) {
    return {
      headline: `Trauma First-Aid: Road or Scooter Accident (${dest})`,
      urgencyLevel: "Critical",
      badge: "🚨 Accident & Trauma Response",
      firstAidSteps: [
        "Ensure the area is safe from incoming traffic before approaching.",
        "Check breathing and responsiveness. If spine injury is suspected, DO NOT move the victim's neck.",
        "Control active bleeding by applying firm, steady pressure with a clean cloth or bandage.",
        "Dial 1990 (Free National Ambulance) and 119 (Police) immediately.",
        "Keep the victim warm with a blanket or jacket while awaiting paramedics.",
      ],
      warnings: [
        "Do not offer water or food to an unconscious or heavily injured person.",
        "Do not remove a motorcycle helmet if head or spinal trauma is suspected unless airway is compromised.",
      ],
      hotline: "1990 Ambulance & 119 Police Hotline",
      nearestHospitalRecommendation: hospital,
      sinhalaPhrases: [
        {
          english: "There was a road accident here! Send an ambulance quickly!",
          sinhala: "මෙතන අනතුරක් වුණා! ඉක්මනට ඇම්බියුලන්ස් එකක් එවන්න!",
          singlishPhonetics: "Metana anathurak wuna! Ikmanata ambulance ekak ewanna!",
        },
        {
          english: "Where is the nearest hospital?",
          sinhala: "ළඟම තියෙන ඉස්පිරිතාලෙ කොහෙද?",
          singlishPhonetics: "Langama thiyena ispirithale koheda?",
        },
      ],
      provider: "curated-srilanka-safety-kb",
    };
  }

  // 4. Food Poisoning / Severe Dehydration / Fever
  if (q.includes("food") || q.includes("poisoning") || q.includes("vomit") || q.includes("diarrhea") || q.includes("stomach") || q.includes("fever")) {
    return {
      headline: `Medical Advisory: Acute Food Illness & Dehydration (${dest})`,
      urgencyLevel: "Moderate",
      badge: "💊 Gastrointestinal & Hydration Care",
      firstAidSteps: [
        "Start oral rehydration salts (Jeevani in Sri Lanka) or clean bottled water with pinch of salt/sugar.",
        "Drink King Coconut water (Thambili) - widely available across Sri Lanka and rich in natural electrolytes.",
        "Avoid dairy, greasy curries, alcohol, and caffeine for the next 24 hours.",
        "Rest in a cool, well-ventilated room to prevent heat exhaustion.",
        "Visit a local pharmacy ('Beheth Shalawa') for rehydration sachets or a registered GP clinic.",
      ],
      warnings: [
        "Seek immediate emergency care if you have high fever, bloody stool, or cannot keep fluids down for 12+ hours.",
      ],
      hotline: "1990 Ambulance (If unresponsive/severe dehydration)",
      nearestHospitalRecommendation: hospital,
      sinhalaPhrases: [
        {
          english: "I have stomach pain and need medicine.",
          sinhala: "මට බඩේ අමාරුවක් තියෙනවා, මට බෙහෙත් ඕනෙ.",
          singlishPhonetics: "Mata bade amaruwak thiyenawa, mata beheth one.",
        },
      ],
      provider: "curated-srilanka-safety-kb",
    };
  }

  // 5. Default General Travel Crisis
  return {
    headline: `Emergency First-Aid & Travel Assistance (${dest})`,
    urgencyLevel: "Urgent",
    badge: "ℹ️ Sri Lanka Tourist Assistance",
    firstAidSteps: [
      `Contact 1990 (National Free Ambulance) immediately if medical assistance is required.`,
      `For police assistance or tourist disputes, call Tourist Police at 011-2421052.`,
      `Notify your hotel front desk or host; they can summon trusted local doctors or transport.`,
      `Keep your passport and travel insurance policy numbers handy.`,
    ],
    warnings: [
      "Always use metered Tuk-tuks (PickMe/Uber) or hotel-arranged transport during emergencies.",
    ],
    hotline: "1990 Ambulance / 119 Police / 011-2421052 Tourist Police",
    nearestHospitalRecommendation: hospital,
    sinhalaPhrases: [
      {
        english: "I need urgent help, please assist me.",
        sinhala: "මට හදිසි උදව්වක් ඕනෙ, කරුණාකරලා උදව් කරන්න.",
        singlishPhonetics: "Mata hadisi udawwak one, karunakarala udaw karanna.",
      },
    ],
    provider: "curated-srilanka-safety-kb",
  };
}

// Main Gemini AI Function
async function getEmergencyGuidanceWithGemini({ query, destination = "Sri Lanka", userCoords }) {
  if (!query || !query.trim()) {
    throw new Error("Emergency query or symptom description is required");
  }

  const apiKey = process.env.GEMINI_API_KEY;

  // If no API key configured, use curated local knowledge base
  if (!apiKey) {
    console.info("[GeminiSafetyService] GEMINI_API_KEY not configured. Using curated local safety knowledge base.");
    return getLocalSafetyFallback({ query, destination });
  }

  const prompt = `You are an expert emergency first-responder and travel safety doctor specializing in tourism safety across Sri Lanka.
A traveler in "${destination}", Sri Lanka reported the following emergency / health situation:
"${query.trim()}"

Analyze this situation and provide medically sound, localized first-aid guidance tailored to Sri Lanka's healthcare environment.

Requirements:
- "headline": Short, actionable headline.
- "urgencyLevel": MUST be one of ["Critical", "Urgent", "Moderate", "Mild"].
- "badge": 3-4 word badge (e.g. "🚨 Critical Immediate Care", "🌊 Marine First-Aid", "💊 Pharmacy Consultation").
- "firstAidSteps": Exactly 4 to 5 concise, step-by-step immediate actions the traveler or bystander should take right now.
- "warnings": 1 to 2 critical warnings of what NOT to do.
- "hotline": The exact Sri Lankan hotline to dial (e.g., 1990 for medical emergency, 119 for police/crime, 011-2421052 for Tourist Police).
- "nearestHospitalRecommendation": Best type or name of facility in ${destination} (Government Teaching Hospital, District Base Hospital, or Private Emergency). Note that Sri Lankan government hospitals provide emergency treatment to foreigners.
- "sinhalaPhrases": Array of 2 essential phrases a traveler can show or speak to a local Sri Lankan / tuk-tuk driver. Each phrase MUST contain:
    - "english": English sentence
    - "sinhala": Sinhala script translation
    - "singlishPhonetics": Phonetic English pronunciation (Singlish)

Reply ONLY with valid, raw JSON (no markdown formatting, no codeblocks).

JSON Schema:
{
  "headline": "Short title",
  "urgencyLevel": "Critical",
  "badge": "Badge title",
  "firstAidSteps": ["Step 1", "Step 2", "Step 3", "Step 4"],
  "warnings": ["Warning 1"],
  "hotline": "1990 Suwa Seriya",
  "nearestHospitalRecommendation": "Hospital recommendation in ${destination}",
  "sinhalaPhrases": [
    {
      "english": "Help, take me to hospital",
      "sinhala": "උදව් කරන්න, මාව ඉස්පිරිතාලෙට ගෙනියන්න",
      "singlishPhonetics": "Udaw karanna, mawa ispirithaleta geniyanna"
    }
  ]
}`;

  const candidateModels = [
    process.env.GEMINI_MODEL,
    "gemini-1.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash-8b",
  ].filter(Boolean);

  let data = null;

  for (const model of candidateModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(8000),
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            topK: 30,
            topP: 0.9,
          },
        }),
      });

      if (!response.ok) {
        console.warn(`[GeminiSafetyService] Model ${model} returned status ${response.status}. Trying next...`);
        continue;
      }

      data = await response.json();
      break;
    } catch (err) {
      console.warn(`[GeminiSafetyService] Model ${model} failed: ${err.message}. Trying next...`);
    }
  }

  if (!data) {
    console.warn("[GeminiSafetyService] All Gemini candidate models failed or timed out. Falling back to local knowledge base.");
    return getLocalSafetyFallback({ query, destination });
  }

  try {
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const cleanText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleanText);

    return {
      ...parsed,
      destination,
      provider: "gemini-ai",
    };
  } catch (parseErr) {
    console.warn("[GeminiSafetyService] JSON parse error from Gemini output. Using fallback.", parseErr);
    return getLocalSafetyFallback({ query, destination });
  }
}

module.exports = {
  getEmergencyGuidanceWithGemini,
  getLocalSafetyFallback,
  SRI_LANKA_REGIONAL_HOSPITALS,
};
