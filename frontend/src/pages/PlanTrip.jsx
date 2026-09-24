import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { destinationCatalog, getDestinationData } from "../data/travelCatalog";
import {
  getActivityPhoto,
  getDestinationPhoto,
  getPexelsDestinationPhoto,
  getLocalActivityFallback,
} from "../utils/activityImages";
import WeatherAlert from "../components/WeatherAlert";
import "./PlanTrip.css";

const locationInterests = {
  kandy: ["Culture", "Nature", "Temples", "Sightseeing"],
  ella: ["Hiking", "Nature", "Waterfalls", "Scenic Views"],
  galle: ["Beaches", "History", "Food", "Sightseeing"],
  mirissa: ["Beaches", "Whale Watching", "Surfing", "Relaxation"],
  sigiriya: ["History", "Culture", "Nature", "Adventure"],
  colombo: ["Food", "Shopping", "Nightlife", "Culture"],
  "nuwara eliya": ["Nature", "Tea Estates", "Hiking", "Scenic Views"],
  trincomalee: ["Beaches", "Snorkeling", "History", "Relaxation"],
};

// Smart seasonal destination recommendation based on Sri Lankan monsoon & climate patterns
function getSeasonalRecommendations(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return null;
  const month = date.getMonth() + 1; // 1 (Jan) - 12 (Dec)

  // 1. December to April: South & West Coast + Hill Country High Season
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
    };
  }

  // 2. May to September: East Coast & Cultural Triangle Dry Season
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
    };
  }

  // 3. October to November: Inter-Monsoon / Central Highlands Season
  return {
    seasonBadge: "Central Highlands & Cultural Heritage",
    weatherHint: "Misty tea hills, lush green landscapes & vibrant cultural landmarks.",
    destinations: [
      { name: "Kandy", tag: "Cultural Capital", desc: "Temple of the Tooth, royal botanical gardens & misty lake" },
      { name: "Nuwara Eliya", tag: "Little England", desc: "Cool mountain climate, tea estates & colonial bungalows" },
      { name: "Sigiriya", tag: "Heritage & Nature", desc: "Ancient rock citadel with lush surrounding landscapes" },
      { name: "Colombo", tag: "City & Flavors", desc: "Galle Face Green, artisanal dining, shopping & museums" },
    ],
  };
}

function PlanTrip() {
  const [searchParams] = useSearchParams();

  // Wizard Step (1: Basics, 2: Hotels, 3: Activities)
  const [step, setStep] = useState(1);

  // Step 1: Basic Parameters
  const [destination, setDestination] = useState(searchParams.get("destination") || "");
  const [budget, setBudget] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [tripType, setTripType] = useState("Solo");
  const [groupSize, setGroupSize] = useState(3);

  // Step 2: Hotel Selection & API States
  const [hotels, setHotels] = useState([]);
  const [hotelsLoading, setHotelsLoading] = useState(false);
  const [hotelsProvider, setHotelsProvider] = useState("catalog");
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [hotelTierFilter, setHotelTierFilter] = useState("All");
  const [activeDetailHotel, setActiveDetailHotel] = useState(null);
  const [modalViewTab, setModalViewTab] = useState("google");
  const [loadingMoreHotels, setLoadingMoreHotels] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState("");

  // Step 3: Activities Selection & Real Activities API States
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [activitiesProvider, setActivitiesProvider] = useState("catalog");
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [activityCategoryFilter, setActivityCategoryFilter] = useState("All");
  const [loadingMoreActivities, setLoadingMoreActivities] = useState(false);
  const [loadMoreActivitiesError, setLoadMoreActivitiesError] = useState("");

  // Itinerary generation loading state
  const [itineraryLoading, setItineraryLoading] = useState(false);

  // Voice AI States & Intelligence
  const [voiceState, setVoiceState] = useState("idle"); // "idle" | "listening" | "processing" | "success" | "error"
  const [transcriptText, setTranscriptText] = useState("");
  const [voiceMode, setVoiceMode] = useState("voice"); // "voice" | "text"
  const [textInputPrompt, setTextInputPrompt] = useState("");
  const [extractedPlan, setExtractedPlan] = useState(null);
  const [highlightFields, setHighlightFields] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  const recognitionRef = useRef(null);
  const voiceTranscriptRef = useRef("");
  const abortControllerRef = useRef(null);

  // Weather & Seasonal Advisory States
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherAdvisory, setWeatherAdvisory] = useState(null);
  const [weatherError, setWeatherError] = useState("");
  const [advisoryAcknowledged, setAdvisoryAcknowledged] = useState(false);
  const weatherAbortRef = useRef(null);

  // Helper to convert date string (YYYY-MM-DD) month number to full English Month Name
  function getMonthNameFromDate(dateStr) {
    if (!dateStr) return "";
    const parts = String(dateStr).trim().split("-");
    if (parts.length >= 2) {
      const monthNum = parseInt(parts[1], 10);
      const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      if (monthNum >= 1 && monthNum <= 12) {
        return months[monthNum - 1];
      }
    }
    return "";
  }

  // Trigger weather, monsoon & seasonal disaster advisory when destination AND dates are set
  useEffect(() => {
    const trimmedDest = (destination || "").trim();
    if (!trimmedDest || trimmedDest.length < 3 || !startDate || !endDate) {
      setWeatherAdvisory(null);
      setWeatherLoading(false);
      setAdvisoryAcknowledged(false);
      return;
    }

    if (weatherAbortRef.current) {
      weatherAbortRef.current.abort();
    }
    const controller = new AbortController();
    weatherAbortRef.current = controller;

    setWeatherLoading(true);
    setWeatherError("");
    setAdvisoryAcknowledged(false);

    // Convert date month number into month name before passing to Gemini weather advisory
    const startMonth = getMonthNameFromDate(startDate);
    const endMonth = getMonthNameFromDate(endDate);
    const monthName = startMonth === endMonth ? startMonth : `${startMonth} to ${endMonth}`;

    const timer = setTimeout(async () => {
      try {
        const response = await fetch("http://localhost:5000/api/trips/weather-advisory", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            destination: trimmedDest,
            startDate,
            endDate,
            startMonth,
            endMonth,
            monthName,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data?.success && data?.advisory) {
            setWeatherAdvisory(data.advisory);
          }
        } else {
          throw new Error("Weather advisory returned status " + response.status);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.warn("Weather advisory fetch error:", err);
          setWeatherError("Weather advisory service is currently unavailable.");
        }
      } finally {
        if (weatherAbortRef.current === controller) {
          setWeatherLoading(false);
        }
      }
    }, 450);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [destination, startDate, endDate]);

  function handleSelectAlternateDestination(altDest) {
    if (!altDest) return;
    setDestination(altDest);
    setSelectedHotel(null);
    setSelectedActivities([]);
    setHotels([]);
    setActivities([]);
    setAdvisoryAcknowledged(false);
  }

  const navigate = useNavigate();

  // Destination data from catalog
  const destinationData = useMemo(() => {
    return getDestinationData(destination);
  }, [destination]);

  // Smart seasonal recommendations state (Dynamic Gemini AI with instant local fallback)
  const [seasonalRecommendations, setSeasonalRecommendations] = useState(null);
  const [seasonalLoading, setSeasonalLoading] = useState(false);
  const [seasonalProvider, setSeasonalProvider] = useState("catalog"); // "gemini" | "catalog"

  useEffect(() => {
    if (!startDate) {
      setSeasonalRecommendations(null);
      setSeasonalProvider("catalog");
      return;
    }

    // 1. Immediately provide local fallback so UI responds with 0ms delay
    const initialFallback = getSeasonalRecommendations(startDate);
    setSeasonalRecommendations(initialFallback);
    setSeasonalProvider("catalog");

    // 2. Dynamically fetch AI-generated analysis via backend Gemini AI
    let isMounted = true;
    const controller = new AbortController();

    async function loadGeminiSeasonal() {
      setSeasonalLoading(true);
      try {
        const query = new URLSearchParams({
          startDate,
          endDate: endDate || "",
        });
        const res = await fetch(`http://localhost:5000/api/trips/seasonal-recommendations?${query.toString()}`, {
          signal: controller.signal,
        });

        if (res.ok) {
          const data = await res.json();
          if (isMounted && data?.recommendations?.destinations?.length > 0) {
            setSeasonalRecommendations(data.recommendations);
            setSeasonalProvider(data.recommendations.provider || "gemini");
          }
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.warn("[PlanTrip] Gemini seasonal fetch error, using local fallback:", err);
        }
      } finally {
        if (isMounted) {
          setSeasonalLoading(false);
        }
      }
    }

    loadGeminiSeasonal();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [startDate, endDate]);

  // Clean Voice Audio Feedback using Browser SpeechSynthesis
  function speakVoiceResponse(text) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis error:", e);
    }
  }

  function stopSpeaking() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }

  // Stop all active Voice AI operations (listening, backend parsing fetch, and speech audio playback)
  function handleStopVoiceAI() {
    // 1. Abort backend fetch request if pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // 2. Abort speech recognition if active
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null; // Prevent onend from triggering handleProcessVoiceTranscript
        recognitionRef.current.abort();
      } catch (e) {
        console.warn("Speech recognition abort error:", e);
      }
      recognitionRef.current = null;
    }

    // 3. Cancel TTS SpeechSynthesis audio
    stopSpeaking();

    // 4. Reset voice state to idle with explicit user feedback
    voiceTranscriptRef.current = "";
    setVoiceState("idle");
    setTranscriptText("Voice AI stopped. Tap to speak or type your plan.");
  }

  // Instant Local Heuristic Parser (Fast Offline Fallback)
  function localSmartParser(speechText) {
    const text = speechText.toLowerCase();
    const today = new Date();

    // 1. Destination Match
    const allKnown = [
      "ella", "kandy", "galle", "mirissa", "sigiriya", "nuwara eliya", "colombo", "trincomalee",
      "bentota", "ahangama", "weligama", "hiriketiya", "yala", "jaffna", "anuradhapura",
      "polonnaruwa", "dambulla", "negombo", "tangalle", "unawatuna", "hikkaduwa", "hatton"
    ];
    let foundDest = "Ella";
    for (const d of allKnown) {
      if (text.includes(d)) {
        foundDest = d.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
        break;
      }
    }

    // 2. Budget Match
    let parsedBudget = 65000;
    const lakhMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|lac|lacs)/i);
    if (lakhMatch) {
      parsedBudget = Math.round(parseFloat(lakhMatch[1]) * 100000);
    } else {
      const kMatch = text.match(/(\d+(?:\.\d+)?)\s*k\b/i);
      if (kMatch) {
        parsedBudget = Math.round(parseFloat(kMatch[1]) * 1000);
      } else {
        const thousandMatch = text.match(/(\d+)\s*(?:thousand)/i);
        if (thousandMatch) {
          parsedBudget = parseInt(thousandMatch[1], 10) * 1000;
        } else {
          const numMatch = text.match(/(\d{4,7})/);
          if (numMatch) {
            parsedBudget = parseInt(numMatch[1], 10);
          }
        }
      }
    }

    // 3. Trip Type & Group Size
    let parsedType = "Solo";
    let parsedGroup = 1;
    if (
      text.includes("girlfriend") ||
      text.includes("boyfriend") ||
      text.includes("wife") ||
      text.includes("husband") ||
      text.includes("couple") ||
      text.includes("romantic") ||
      text.includes("partner")
    ) {
      parsedType = "Couple";
      parsedGroup = 2;
    } else if (text.includes("family") || text.includes("kids") || text.includes("parents")) {
      parsedType = "Family";
      const count = text.match(/(\d+)\s*(?:people|members|persons)/);
      parsedGroup = count ? Math.max(3, parseInt(count[1], 10)) : 4;
    } else if (text.includes("friend") || text.includes("friends") || text.includes("group") || text.includes("buddies")) {
      parsedType = "Friends";
      const count = text.match(/(\d+)\s*(?:people|friends|members|persons)/);
      parsedGroup = count ? Math.max(3, parseInt(count[1], 10)) : 4;
    } else if (text.includes("alone") || text.includes("solo") || text.includes("myself")) {
      parsedType = "Solo";
      parsedGroup = 1;
    }

    // 4. Duration & Dates
    let parsedDays = 3;
    const daysMatch = text.match(/(\d+)\s*(?:day|days)/i);
    const nightsMatch = text.match(/(\d+)\s*(?:night|nights)/i);
    if (daysMatch) {
      parsedDays = parseInt(daysMatch[1], 10);
    } else if (nightsMatch) {
      parsedDays = parseInt(nightsMatch[1], 10) + 1;
    } else if (text.includes("weekend")) {
      parsedDays = 2;
    } else if (text.includes("week")) {
      parsedDays = 7;
    }
    parsedDays = Math.max(1, Math.min(14, parsedDays));

    const start = new Date(today);
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
      start.setDate(start.getDate() + 2);
    }

    const end = new Date(start);
    end.setDate(start.getDate() + parsedDays - 1);

    return {
      destination: foundDest,
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
      days: parsedDays,
      budget: parsedBudget,
      tripType: parsedType,
      groupSize: parsedGroup,
      summary: `${foundDest} • ${parsedDays} Days • ${parsedType} • LKR ${parsedBudget.toLocaleString()}`,
      voiceConfirmation: `I've set up your ${parsedDays}-day ${parsedType.toLowerCase()} trip to ${foundDest} with an LKR ${parsedBudget.toLocaleString()} budget.`,
    };
  }

  // Apply parsed parameters directly to Step 1 form fields with visual glow
  function applyTripPlan(plan) {
    if (!plan) return;
    if (plan.destination) {
      setDestination(plan.destination);
      setSelectedHotel(null);
      setSelectedActivities([]);
      setHotels([]);
      setActivities([]);
    }
    if (plan.startDate) setStartDate(plan.startDate);
    if (plan.endDate) setEndDate(plan.endDate);
    if (plan.budget) setBudget(String(plan.budget));
    if (plan.tripType) setTripType(plan.tripType);
    if (plan.groupSize) setGroupSize(Number(plan.groupSize));

    // Flash form fields to highlight the auto-filled changes
    setHighlightFields(true);
    setTimeout(() => setHighlightFields(false), 2400);
  }

  // Process voice/natural language transcript using backend Gemini AI + local fallback
  async function handleProcessVoiceTranscript(rawText, playAudio = false) {
    if (!rawText || !rawText.trim()) return;

    // Abort previous backend fetch if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setVoiceState("processing");
    setTranscriptText(`"${rawText}"`);

    // 1. Instant local optimistic update so UI is immediately responsive
    const localPlan = localSmartParser(rawText);
    applyTripPlan(localPlan);

    // 2. Call backend Gemini AI for advanced semantic understanding
    try {
      const response = await fetch("http://localhost:5000/api/trips/parse-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          transcript: rawText,
          currentDate: new Date().toISOString().split("T")[0],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data?.success && data?.plan) {
          applyTripPlan(data.plan);
          setExtractedPlan(data.plan);
          setVoiceState("success");
          if (data.plan.voiceConfirmation && playAudio) {
            speakVoiceResponse(data.plan.voiceConfirmation);
          }
          abortControllerRef.current = null;
          return;
        }
      }
    } catch (err) {
      if (err.name === "AbortError") {
        console.log("[Voice AI] Backend parse request aborted by user.");
        return;
      }
      console.warn("Backend Gemini voice parse error, keeping local plan:", err);
    }

    if (abortControllerRef.current === controller) {
      // Fallback to local plan if backend was unreachable
      setExtractedPlan(localPlan);
      setVoiceState("success");
      if (localPlan.voiceConfirmation && playAudio) {
        speakVoiceResponse(localPlan.voiceConfirmation);
      }
      abortControllerRef.current = null;
    }
  }

  // Complete voice listening immediately and process whatever has been captured so far
  function handleCompleteVoiceListening() {
    const textToProcess = (voiceTranscriptRef.current || "").trim();

    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null; // Prevent duplicate invocation from onend
        recognitionRef.current.stop();
      } catch (e) {
        console.warn("Speech recognition stop error:", e);
      }
      recognitionRef.current = null;
    }

    if (textToProcess.length >= 3) {
      handleProcessVoiceTranscript(textToProcess);
    } else {
      setVoiceState("idle");
      setTranscriptText("No speech was detected. Tap to try again or type your plan.");
    }
  }

  // Interactive Voice Recording handler with live SpeechRecognition
  function handleToggleVoiceListening() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      setVoiceMode("text");
      setVoiceState("error");
      setTranscriptText("Voice input is not supported in this browser. You can type below instead!");
      return;
    }

    // If currently listening, tapping the button immediately completes voice capture and processes
    if (voiceState === "listening") {
      handleCompleteVoiceListening();
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognitionRef.current = recognition;
      voiceTranscriptRef.current = "";

      recognition.onstart = () => {
        setVoiceState("listening");
        setTranscriptText("Listening... Describe your destination, duration, budget, and who is traveling.");
      };

      recognition.onresult = (event) => {
        let fullTranscript = "";
        for (let i = 0; i < event.results.length; i++) {
          fullTranscript += event.results[i][0].transcript;
        }
        const cleanText = fullTranscript.trim();
        voiceTranscriptRef.current = cleanText;
        setTranscriptText(cleanText ? `"${cleanText}"` : "Listening...");
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error === "no-speech") {
          if (!voiceTranscriptRef.current || !voiceTranscriptRef.current.trim()) {
            setVoiceState("idle");
            setTranscriptText("No speech was detected. Tap to try again.");
          }
        } else if (event.error === "not-allowed") {
          setVoiceState("error");
          setTranscriptText("Microphone access was denied. Please check your browser permissions or type your plan.");
        } else {
          setVoiceState("error");
          setTranscriptText("Could not capture audio. Please try again or type below.");
        }
      };

      recognition.onend = () => {
        if (capturedText && capturedText.trim().length > 3) {
          handleProcessVoiceTranscript(capturedText.trim(), true);
        } else if (voiceState === "listening") {
          setVoiceState("idle");
        }
      };

      recognition.start();
    } catch (e) {
      console.error("Speech recognition start error:", e);
      setVoiceState("error");
      setTranscriptText("Could not start microphone. Please try typing your plan.");
    }
  }

  function handleSamplePromptClick(samplePrompt) {
    setTextInputPrompt(samplePrompt);
    handleProcessVoiceTranscript(samplePrompt, false);
  }

  function getTravelerCount() {
    if (tripType === "Solo") return 1;
    if (tripType === "Couple") return 2;
    return Number(groupSize) || 3;
  }

  function calculateNights() {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays);
  }

  // Fetch hotels from backend API (Amadeus / Provider adapter)
  async function fetchHotelsFromApi() {
    setHotelsLoading(true);
    try {
      const query = new URLSearchParams({
        destination,
        budget: budget || 75000,
        startDate,
        endDate,
        travelers: getTravelerCount(),
      });

      const response = await fetch(`http://localhost:5000/api/hotels?${query.toString()}`);
      if (response.ok) {
        const data = await response.json();
        const list = data.hotels || [];
        setHotels(list);
        setHotelsProvider(data.provider || "catalog");

        // Pre-select best match
        if (list.length > 0 && !selectedHotel) {
          const targetNightly = (Number(budget) * 0.4) / calculateNights();
          const closest = list.reduce((prev, curr) => {
            return Math.abs(curr.pricePerNight - targetNightly) < Math.abs(prev.pricePerNight - targetNightly)
              ? curr
              : prev;
          });
          setSelectedHotel(closest || list[0]);
        }
      } else {
        throw new Error("Hotel API returned " + response.status);
      }
    } catch (err) {
      console.warn("Hotel API query failed, falling back to local catalog:", err);
      const data = getDestinationData(destination);
      if (data && data.hotels) {
        setHotels(data.hotels);
        setHotelsProvider("catalog");
        if (!selectedHotel && data.hotels.length > 0) {
          setSelectedHotel(data.hotels[0]);
        }
      }
    } finally {
      setHotelsLoading(false);
    }
  }

  // Default to Google Preview when activeDetailHotel changes
  useEffect(() => {
    setModalViewTab("google");
  }, [activeDetailHotel]);

  // Google Maps interactive embed & directions helpers
  function getGoogleMapsEmbedUrl(hotelName, dest) {
    const query = `${hotelName || "Hotel"}, ${dest || destination || "Sri Lanka"}, Sri Lanka`;
    return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  }

  function getGoogleDirectionsEmbedUrl(hotelName, dest) {
    const origin = "Bandaranaike International Airport, Katunayake";
    const destQuery = `${hotelName || "Hotel"}, ${dest || destination || "Sri Lanka"}, Sri Lanka`;
    return `https://maps.google.com/maps?saddr=${encodeURIComponent(origin)}&daddr=${encodeURIComponent(destQuery)}&output=embed`;
  }

  function getGooglePlaceSearchUrl(hotelName, dest) {
    return `https://www.google.com/maps/search/${encodeURIComponent(`${hotelName || "Hotel"} ${dest || destination || "Sri Lanka"} Sri Lanka`)}`;
  }

  function getGoogleDirectionsExternalUrl(hotelName, dest) {
    const origin = "Bandaranaike International Airport, Katunayake, Sri Lanka";
    const destQuery = `${hotelName || "Hotel"}, ${dest || destination || "Sri Lanka"}, Sri Lanka`;
    return `https://www.google.com/maps/dir/${encodeURIComponent(origin)}/${encodeURIComponent(destQuery)}`;
  }

  // Handle modal escape key and background scroll lock
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        setActiveDetailHotel(null);
      }
    }
    if (activeDetailHotel) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [activeDetailHotel]);

  // Fetch 4 additional hotels excluding currently displayed hotels
  async function handleLoadMoreHotels() {
    if (loadingMoreHotels) return;
    setLoadingMoreHotels(true);
    setLoadMoreError("");

    try {
      const existingHotelNames = hotels.map((h) => h.name).join(",");
      const query = new URLSearchParams({
        destination,
        budget: budget || 75000,
        startDate,
        endDate,
        travelers: getTravelerCount(),
        exclude: existingHotelNames,
      });

      const response = await fetch(`http://localhost:5000/api/hotels?${query.toString()}`);
      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      const newHotels = data.hotels || [];

      if (newHotels.length === 0) {
        setLoadMoreError(`All available hotel options for ${destination} are currently shown.`);
        return;
      }

      // Deduplicate against existing hotels by id and lower-cased name
      const existingIds = new Set(hotels.map((h) => h.id));
      const existingNames = new Set(hotels.map((h) => (h.name || "").toLowerCase().trim()));

      const uniqueNewHotels = newHotels.filter(
        (h) => !existingIds.has(h.id) && !existingNames.has((h.name || "").toLowerCase().trim())
      );

      if (uniqueNewHotels.length === 0) {
        setLoadMoreError("All top recommendations have already been loaded.");
        return;
      }

      setHotels((prev) => [...prev, ...uniqueNewHotels]);
    } catch (err) {
      console.error("Failed to load more hotels:", err);
      setLoadMoreError("Could not retrieve more hotels at this time. Please try again.");
    } finally {
      setLoadingMoreHotels(false);
    }
  }

  // Fetch real activities from backend API (Gemini AI / Curated Fallback)
  async function fetchActivitiesFromApi(customDest) {
    const dest = customDest || destination;
    if (!dest) return;

    setActivitiesLoading(true);
    setLoadMoreActivitiesError("");
    try {
      const query = new URLSearchParams({
        destination: dest,
        budget: budget || 75000,
        tripType,
        travelers: getTravelerCount(),
      });

      const response = await fetch(`http://localhost:5000/api/activities?${query.toString()}`);
      if (response.ok) {
        const data = await response.json();
        const list = data.activities || [];
        setActivities(list);
        setActivitiesProvider(data.provider || "catalog");

        // Pre-select first 3 if none selected yet
        if (selectedActivities.length === 0 && list.length > 0) {
          setSelectedActivities(list.slice(0, 3));
        }
      } else {
        throw new Error("Activity API returned status " + response.status);
      }
    } catch (err) {
      console.warn("Activity API query failed, falling back to local catalog:", err);
      const data = getDestinationData(dest);
      if (data && data.activities) {
        setActivities(data.activities);
        setActivitiesProvider("catalog");
        if (selectedActivities.length === 0 && data.activities.length > 0) {
          setSelectedActivities(data.activities.slice(0, 3));
        }
      }
    } finally {
      setActivitiesLoading(false);
    }
  }

  // Fetch additional real activities excluding currently displayed activities
  async function handleLoadMoreActivities() {
    if (loadingMoreActivities) return;
    setLoadingMoreActivities(true);
    setLoadMoreActivitiesError("");

    try {
      const existingActivityTitles = activities.map((a) => a.title).join(",");
      const query = new URLSearchParams({
        destination,
        budget: budget || 75000,
        tripType,
        travelers: getTravelerCount(),
        exclude: existingActivityTitles,
      });

      const response = await fetch(`http://localhost:5000/api/activities?${query.toString()}`);
      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      const newActivities = data.activities || [];

      if (newActivities.length === 0) {
        setLoadMoreActivitiesError(`All top real activities for ${destination} are currently loaded.`);
        return;
      }

      // Deduplicate against existing activities by id and lowercase title
      const existingIds = new Set(activities.map((a) => a.id));
      const existingTitles = new Set(activities.map((a) => (a.title || "").toLowerCase().trim()));

      const uniqueNew = newActivities.filter(
        (a) => !existingIds.has(a.id) && !existingTitles.has((a.title || "").toLowerCase().trim())
      );

      if (uniqueNew.length === 0) {
        setLoadMoreActivitiesError("All available real activities have already been loaded.");
        return;
      }

      setActivities((prev) => [...prev, ...uniqueNew]);
    } catch (err) {
      console.error("Failed to load more activities:", err);
      setLoadMoreActivitiesError("Could not retrieve more activities at this time. Please try again.");
    } finally {
      setLoadingMoreActivities(false);
    }
  }

  // Step 1 Validation & Proceed
  function handleContinueToHotels(e) {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }
    if (!destination.trim()) {
      alert("Please enter a destination in Sri Lanka.");
      return;
    }
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }
    if (!budget || Number(budget) <= 0) {
      alert("Please enter a valid travel budget.");
      return;
    }
    if (weatherAdvisory?.hasAdvisory && !advisoryAcknowledged) {
      alert(`Please review the weather advisory for ${destination} before proceeding, or select one of the suggested alternate destinations.`);
      return;
    }

    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
    fetchHotelsFromApi();
  }

  // Budget Tier presets helper for dark UI cards
  function handleSelectBudgetTier(tier) {
    const nights = Math.max(1, calculateNights());
    if (tier === "budget") {
      setBudget(String(Math.max(45000, nights * 15000)));
    } else if (tier === "standard") {
      setBudget(String(Math.max(85000, nights * 28000)));
    } else if (tier === "luxury") {
      setBudget(String(Math.max(180000, nights * 60000)));
    }
  }

  const activeBudgetTier = useMemo(() => {
    const val = Number(budget) || 0;
    if (val <= 0) return null;
    if (val <= 55000) return "budget";
    if (val <= 130000) return "standard";
    return "luxury";
  }, [budget]);

  // Step 2 Validation & Proceed
  function handleContinueToActivities() {
    if (!selectedHotel) {
      alert("Please choose a hotel recommendation before continuing.");
      return;
    }

    setStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Automatically trigger real activities fetch if not yet loaded
    if (activities.length === 0) {
      fetchActivitiesFromApi();
    }
  }

  // Toggle Activity Selection
  function toggleActivity(activity) {
    const exists = selectedActivities.some((a) => a.id === activity.id);
    if (exists) {
      setSelectedActivities(selectedActivities.filter((a) => a.id !== activity.id));
    } else {
      setSelectedActivities([...selectedActivities, activity]);
    }
  }

  // Generate Day-by-Day Itinerary from chosen activities with structured travel-app metadata
  function buildCustomItinerary(daysCount, activities, destName, hotel) {
    const itineraryList = [];
    const pool = [...activities];

    for (let dayNum = 1; dayNum <= daysCount; dayNum++) {
      const dayActivities = [];

      if (dayNum === 1) {
        const hotelName = hotel?.name || "Your Hotel";
        dayActivities.push({
          slot: "Morning",
          time: "09:00 AM",
          duration: "1 - 2 hrs",
          location: `Check-in: ${hotelName}`,
          description: `Arrive in ${destName}, check in at ${hotelName}, unpack, and refresh after your journey.`,
          category: "Arrival & Check-in",
        });

        const act1 = pool.shift();
        dayActivities.push(
          act1
            ? {
              slot: "Afternoon",
              time: "01:30 PM",
              duration: act1.duration || "2 - 3 hrs",
              location: act1.title,
              description: act1.description,
              category: act1.category || "Sightseeing",
              highlight: act1.highlight || act1.tip || null,
            }
            : {
              slot: "Afternoon",
              time: "01:30 PM",
              duration: "2 - 3 hrs",
              location: `${destName} Old Town & Viewpoints`,
              description: `Explore ${destName} town center, scenic viewpoints, artisan boutiques, and local cafes.`,
              category: "Exploration",
              highlight: null,
            }
        );

        const act2 = pool.shift();
        dayActivities.push(
          act2
            ? {
              slot: "Evening",
              time: "06:30 PM",
              duration: act2.duration || "2 hrs",
              location: act2.title,
              description: act2.description,
              category: act2.category || "Evening",
              highlight: act2.highlight || act2.tip || null,
            }
            : {
              slot: "Evening",
              time: "06:30 PM",
              duration: "2 hrs",
              location: `${destName} Local Dining Experience`,
              description: `Enjoy a traditional Sri Lankan rice & curry dinner and relaxed evening atmosphere near ${hotelName}.`,
              category: "Dining",
              highlight: null,
            }
        );
      } else if (dayNum === daysCount) {
        const act1 = pool.shift();
        dayActivities.push(
          act1
            ? {
              slot: "Morning",
              time: "08:30 AM",
              duration: act1.duration || "2 - 3 hrs",
              location: act1.title,
              description: act1.description,
              category: act1.category || "Sightseeing",
              highlight: act1.highlight || act1.tip || null,
            }
            : {
              slot: "Morning",
              time: "08:30 AM",
              duration: "2 hrs",
              location: `${destName} Sunrise Nature Walk`,
              description: `Scenic morning stroll and leisurely breakfast at ${hotel?.name || "your accommodation"}.`,
              category: "Nature",
              highlight: null,
            }
        );

        const act2 = pool.shift();
        dayActivities.push(
          act2
            ? {
              slot: "Afternoon",
              time: "01:30 PM",
              duration: act2.duration || "2 hrs",
              location: act2.title,
              description: act2.description,
              category: act2.category || "Shopping",
              highlight: act2.highlight || act2.tip || null,
            }
            : {
              slot: "Afternoon",
              time: "01:30 PM",
              duration: "2 hrs",
              location: "Ceylon Tea & Spice Boutiques",
              description: "Souvenir shopping for authentic Ceylon single-origin tea, aromatic spices, and local artisan woodcrafts.",
              category: "Shopping",
              highlight: null,
            }
        );

        dayActivities.push({
          slot: "Evening",
          time: "06:30 PM",
          duration: "2 hrs",
          location: `Sunset Farewell Dinner in ${destName}`,
          description: `Farewell sunset dinner overlooking scenic panoramas and prepare for departure from ${destName}.`,
          category: "Departure",
          highlight: null,
        });
      } else {
        const act1 = pool.shift();
        dayActivities.push(
          act1
            ? {
              slot: "Morning",
              time: "08:30 AM",
              duration: act1.duration || "2 - 3 hrs",
              location: act1.title,
              description: act1.description,
              category: act1.category || "Adventure",
              highlight: act1.highlight || act1.tip || null,
            }
            : {
              slot: "Morning",
              time: "08:30 AM",
              duration: "2 - 3 hrs",
              location: `${destName} Hidden Sights & Viewpoints`,
              description: `Morning discovery of scenic hidden gems, photo stops, and lush surrounding nature.`,
              category: "Sightseeing",
              highlight: null,
            }
        );

        const act2 = pool.shift();
        dayActivities.push(
          act2
            ? {
              slot: "Afternoon",
              time: "01:30 PM",
              duration: act2.duration || "2 - 3 hrs",
              location: act2.title,
              description: act2.description,
              category: act2.category || "Sightseeing",
              highlight: act2.highlight || act2.tip || null,
            }
            : {
              slot: "Afternoon",
              time: "01:30 PM",
              duration: "2 hrs",
              location: "Estate Trails & Nature Leisure",
              description: `Afternoon relaxation, tea trail walking, or swimming around ${destName}.`,
              category: "Leisure",
              highlight: null,
            }
        );

        const act3 = pool.shift();
        dayActivities.push(
          act3
            ? {
              slot: "Evening",
              time: "06:30 PM",
              duration: act3.duration || "2 hrs",
              location: act3.title,
              description: act3.description,
              category: act3.category || "Dining",
              highlight: act3.highlight || act3.tip || null,
            }
            : {
              slot: "Evening",
              time: "06:30 PM",
              duration: "2 hrs",
              location: "Night Food Walk & Authentic Eats",
              description: "Savor hot kottu roti, fresh coastal seafood, or hopper platters at a top-rated local night spot.",
              category: "Dining",
              highlight: null,
            }
        );
      }

      itineraryList.push({
        day: dayNum,
        title:
          dayNum === 1
            ? "Arrival & First Explorations"
            : dayNum === daysCount
              ? "Highlights & Farewell"
              : `Adventure & Discovery Day ${dayNum}`,
        activities: dayActivities,
        morning: dayActivities[0]?.description || "",
        afternoon: dayActivities[1]?.description || "",
        evening: dayActivities[2]?.description || "",
      });
    }

    // Distribute any remaining selected activities across days so none are omitted
    let dayIdx = 0;
    while (pool.length > 0 && itineraryList.length > 0) {
      const extraAct = pool.shift();
      const targetDay = itineraryList[dayIdx % itineraryList.length];
      targetDay.activities.push({
        slot: "Afternoon",
        time: "04:00 PM",
        duration: extraAct.duration || "1 - 2 hrs",
        location: extraAct.title,
        description: extraAct.description,
        category: extraAct.category || "Sightseeing",
        highlight: extraAct.highlight || extraAct.tip || null,
      });
      dayIdx++;
    }

    return itineraryList;
  }

  // Final Submission: Generate Full Trip
  function handleGenerateItinerary() {
    if (selectedActivities.length === 0) {
      if (!window.confirm("You haven't selected any activities. Generate with recommended default highlights?")) {
        return;
      }
    }

    setItineraryLoading(true);

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const nights = Math.max(1, days - 1);

    const hotelTotalCost = selectedHotel ? selectedHotel.pricePerNight * nights : Math.round(Number(budget) * 0.4);
    const activitiesTotalCost = selectedActivities.reduce((sum, a) => sum + (a.cost || 0), 0);

    const generatedItinerary = buildCustomItinerary(
      days,
      selectedActivities,
      destination,
      selectedHotel
    );

    const tripData = {
      destination,
      destinationImage: getPexelsDestinationPhoto(destination),
      budget: Number(budget),
      startDate,
      endDate,
      days,
      travelers: getTravelerCount(),
      tripType,
      selectedHotel,
      selectedActivities,
      hotelTotalCost,
      activitiesTotalCost,
      itinerary: generatedItinerary,
      interests: selectedActivities.map((a) => a.category),
    };

    // Show loading animation briefly before navigating
    setTimeout(() => {
      setItineraryLoading(false);
      navigate("/trip-result", { state: tripData });
    }, 2200);
  }

  // Filtered hotels in Step 2
  const filteredHotels = useMemo(() => {
    const sourceList = hotels.length > 0 ? hotels : destinationData?.hotels || [];
    if (hotelTierFilter === "All") return sourceList;
    return sourceList.filter((h) => h.tier === hotelTierFilter);
  }, [hotels, destinationData, hotelTierFilter]);

  // Active activities list (API or fallback catalog)
  const activeActivitiesList = useMemo(() => {
    return activities.length > 0 ? activities : destinationData?.activities || [];
  }, [activities, destinationData]);

  // Filtered activities in Step 3
  const filteredActivities = useMemo(() => {
    if (activityCategoryFilter === "All") return activeActivitiesList;
    return activeActivitiesList.filter((a) => a.category === activityCategoryFilter);
  }, [activeActivitiesList, activityCategoryFilter]);

  // Dynamic available categories from loaded activities
  const availableCategories = useMemo(() => {
    const categoriesSet = new Set(activeActivitiesList.map((a) => a.category).filter(Boolean));
    return ["All", ...Array.from(categoriesSet)];
  }, [activeActivitiesList]);

  const nightsCount = calculateNights();
  const targetHotelBudget = Math.round((Number(budget) || 0) * 0.4);

  return (
    <div className="plan-trip-page">
      <div className="trip-form-card wizard-container">

        {/* Wizard Progress Bar */}
        <div className="wizard-progress-bar">
          <div
            className={`wizard-step-node ${step >= 1 ? "active" : ""} ${step > 1 ? "completed" : ""}`}
            onClick={() => setStep(1)}
          >
            <span className="step-number">{step > 1 ? "✓" : "1"}</span>
            <span className="step-label">Trip Details</span>
          </div>

          <div className={`wizard-step-line ${step >= 2 ? "active" : ""}`} />

          <div
            className={`wizard-step-node ${step >= 2 ? "active" : ""} ${step > 2 ? "completed" : ""}`}
            onClick={() => destination && startDate && endDate && budget && setStep(2)}
          >
            <span className="step-number">{step > 2 ? "✓" : "2"}</span>
            <span className="step-label">Hotel Pick</span>
          </div>

          <div className={`wizard-step-line ${step >= 3 ? "active" : ""}`} />

          <div
            className={`wizard-step-node ${step >= 3 ? "active" : ""} ${step > 3 ? "completed" : ""}`}
            onClick={() => selectedHotel && setStep(3)}
          >
            <span className="step-number">3</span>
            <span className="step-label">Activities</span>
          </div>
        </div>

        {/* ================= STEP 1: TRIP BASICS ================= */}
        {step === 1 && (
          <div className="wizard-step-content dark-theme-step">
            <div className="dark-theme-header">
              <button
                type="button"
                className="theme-back-btn"
                onClick={() => navigate(-1)}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                <span>BACK</span>
              </button>

              <h1 className="dark-main-title">
                Plan your dream <span className="dark-title-muted">trip in seconds.</span>
              </h1>
              <p className="dark-main-desc">
                Provide your preferences and let our advanced AI build a premium, tailored itinerary for your next adventure.
              </p>
            </div>

            <div className="dark-step-1-grid">
              {/* Left Column: Form & Voice Assistant */}
              <div className="dark-form-column">

                {/* Comprehensive Voice AI Planner Assistant */}
                <div className="voice-planner-card dark-glass-card">
                  <div className="voice-planner-top">
                    <div className="voice-title-wrap">
                      <div className={`voice-icon-indicator ${voiceState === "listening" ? "active" : ""}`}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                          <line x1="12" y1="19" x2="12" y2="22"></line>
                        </svg>
                      </div>
                      <div>
                        <div className="voice-title-row">
                          <h3>Voice AI Trip Planner</h3>
                          <span className="voice-ai-badge">Powered by Gemini AI</span>
                        </div>
                        <p className="voice-subtitle">
                          Speak or type naturally. TripMind AI extracts your destination, dates, budget, and travel style automatically.
                        </p>
                      </div>
                    </div>

                    <div className="voice-mode-tabs">
                      <button
                        type="button"
                        className={`voice-tab-btn ${voiceMode === "voice" ? "active" : ""}`}
                        onClick={() => {
                          setVoiceMode("voice");
                          stopSpeaking();
                        }}
                      >
                        Microphone
                      </button>
                      <button
                        type="button"
                        className={`voice-tab-btn ${voiceMode === "text" ? "active" : ""}`}
                        onClick={() => {
                          setVoiceMode("text");
                          stopSpeaking();
                        }}
                      >
                        Type Plan
                      </button>
                    </div>
                  </div>

                  {voiceMode === "voice" ? (
                    <div className="voice-action-area">
                      <div className="voice-btn-container">
                        <button
                          type="button"
                          className={`voice-record-btn ${voiceState === "listening" ? "listening" : ""} ${voiceState === "processing" ? "processing" : ""}`}
                          onClick={handleToggleVoiceListening}
                          disabled={voiceState === "processing"}
                        >
                          {voiceState === "listening" ? (
                            <>
                              <div className="audio-wave-anim">
                                <span className="wave-bar"></span>
                                <span className="wave-bar"></span>
                                <span className="wave-bar"></span>
                                <span className="wave-bar"></span>
                              </div>
                              <span>Listening... Tap to Complete</span>
                            </>
                          ) : voiceState === "processing" ? (
                            <>
                              <span className="mini-spinner white"></span>
                              <span>TripMind AI is analyzing your plan...</span>
                            </>
                          ) : (
                            <>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                                <line x1="12" y1="19" x2="12" y2="22"></line>
                              </svg>
                              <span>Plan Trip with Voice</span>
                            </>
                          )}
                        </button>

                        {(voiceState === "listening" || voiceState === "processing" || isSpeaking) && (
                          <button
                            type="button"
                            className="voice-stop-btn"
                            onClick={handleStopVoiceAI}
                            title="Stop Voice AI Operation"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <rect x="5" y="5" width="14" height="14" rx="2" />
                            </svg>
                            <span>Stop</span>
                          </button>
                        )}
                      </div>

                      {transcriptText && (
                        <div className={`voice-transcript-box ${voiceState}`}>
                          <p>{transcriptText}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <form
                      className="voice-text-prompt-form"
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleProcessVoiceTranscript(textInputPrompt, false);
                      }}
                    >
                      <input
                        type="text"
                        className="voice-prompt-input"
                        placeholder="e.g. 4 days romantic trip to Ella with my girlfriend next Friday on an 85000 budget"
                        value={textInputPrompt}
                        onChange={(e) => setTextInputPrompt(e.target.value)}
                      />
                      <button
                        type="submit"
                        className="voice-prompt-submit"
                        disabled={voiceState === "processing" || !textInputPrompt.trim()}
                      >
                        {voiceState === "processing" ? "Parsing..." : "Apply Plan →"}
                      </button>
                      {(voiceState === "listening" || voiceState === "processing" || isSpeaking) && (
                        <button
                          type="button"
                          className="voice-stop-btn text-mode-stop"
                          onClick={handleStopVoiceAI}
                          title="Stop Voice AI Operation"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="5" y="5" width="14" height="14" rx="2" />
                          </svg>
                          <span>Stop</span>
                        </button>
                      )}
                    </form>
                  )}

                  {/* Extracted Plan Summary Confirmation */}
                  {voiceState === "success" && extractedPlan && (
                    <div className="voice-extracted-summary">
                      <div className="extracted-header">
                        <span className="extracted-status-badge">Preferences Auto-Filled</span>
                        <div className="extracted-audio-actions">
                          {extractedPlan.voiceConfirmation && (
                            <button
                              type="button"
                              className="voice-replay-btn"
                              onClick={() => {
                                if (isSpeaking) {
                                  stopSpeaking();
                                } else {
                                  speakVoiceResponse(extractedPlan.voiceConfirmation);
                                }
                              }}
                            >
                              {isSpeaking ? "Stop Audio" : "Replay AI Audio"}
                            </button>
                          )}
                          {isSpeaking && (
                            <button
                              type="button"
                              className="voice-stop-btn small-stop"
                              onClick={handleStopVoiceAI}
                              title="Stop AI Voice Audio"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <rect x="5" y="5" width="14" height="14" rx="2" />
                              </svg>
                              <span>Stop Voice</span>
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="extracted-chips">
                        <span className="extracted-chip dest">{extractedPlan.destination}</span>
                        <span className="extracted-chip dates">{extractedPlan.days} Days • {extractedPlan.startDate} to {extractedPlan.endDate}</span>
                        <span className="extracted-chip budget">LKR {Number(extractedPlan.budget).toLocaleString()}</span>
                        <span className="extracted-chip type">{extractedPlan.tripType} ({extractedPlan.groupSize || (extractedPlan.tripType === "Couple" ? 2 : 1)} travelers)</span>
                      </div>
                    </div>
                  )}

                  {/* Sample Quick Prompt Chips */}
                  <div className="voice-sample-prompts">
                    <span className="sample-prompts-label">Try speaking or click:</span>
                    <div className="sample-prompts-list">
                      <button
                        type="button"
                        className="sample-prompt-pill"
                        onClick={() => handleSamplePromptClick("4 days romantic trip to Ella with my girlfriend next Friday on 85000 budget")}
                      >
                        "4 days romantic trip to Ella on 85k"
                      </button>
                      <button
                        type="button"
                        className="sample-prompt-pill"
                        onClick={() => handleSamplePromptClick("Family vacation in Kandy for 5 people 3 days around 1.5 lakhs")}
                      >
                        "3 days family vacation in Kandy for 5 people"
                      </button>
                      <button
                        type="button"
                        className="sample-prompt-pill"
                        onClick={() => handleSamplePromptClick("Solo beach trip to Mirissa for a weekend with 45k")}
                      >
                        "Weekend solo beach trip to Mirissa on 45k"
                      </button>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleContinueToHotels} className={`trip-form dark-trip-form ${highlightFields ? "highlight-applied" : ""}`}>

                  {/* Section 1: Where are you going? */}
                  <div className="dark-form-section">
                    <div className="dark-section-title-row">
                      <span className="dark-section-bullet">•</span>
                      <h3 className="dark-section-title">WHERE ARE YOU GOING?</h3>
                    </div>
                    <div className="dark-input-container">
                      <input
                        type="text"
                        className="dark-input-field"
                        placeholder="Search destination..."
                        value={destination}
                        onChange={(e) => {
                          setDestination(e.target.value);
                          setSelectedHotel(null);
                          setSelectedActivities([]);
                          setHotels([]);
                          setActivities([]);
                        }}
                        required
                      />
                      <div className="dark-input-icon-right" title="Search Destination">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="9"></circle>
                          <circle cx="12" cy="12" r="3"></circle>
                          <line x1="12" y1="1" x2="12" y2="4"></line>
                          <line x1="12" y1="20" x2="12" y2="23"></line>
                          <line x1="1" y1="12" x2="4" y2="12"></line>
                          <line x1="20" y1="12" x2="23" y2="12"></line>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: When are you going? */}
                  <div className="dark-form-section">
                    <div className="dark-section-title-row">
                      <span className="dark-section-bullet">•</span>
                      <h3 className="dark-section-title">WHEN ARE YOU GOING?</h3>
                    </div>
                    <div className="dark-date-inputs-row">
                      <div className="dark-date-col">
                        <span className="dark-micro-label">ARRIVAL DATE</span>
                        <div className="dark-input-container with-icon-left">
                          <span className="dark-input-icon-left">
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                              <line x1="16" y1="2" x2="16" y2="6"></line>
                              <line x1="8" y1="2" x2="8" y2="6"></line>
                              <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                          </span>
                          <input
                            type="date"
                            className="dark-input-field date-field"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="dark-date-col">
                        <span className="dark-micro-label">DEPARTURE DATE</span>
                        <div className="dark-input-container with-icon-left">
                          <span className="dark-input-icon-left">
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                              <line x1="16" y1="2" x2="16" y2="6"></line>
                              <line x1="8" y1="2" x2="8" y2="6"></line>
                              <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                          </span>
                          <input
                            type="date"
                            className="dark-input-field date-field"
                            value={endDate}
                            min={startDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: What is your budget? (From Screenshot 3) */}
                  <div className="dark-form-section">
                    <div className="dark-section-title-row">
                      <span className="dark-section-bullet">•</span>
                      <h3 className="dark-section-title">WHAT IS YOUR BUDGET?</h3>
                    </div>

                    <div className="budget-tier-cards-grid">
                      <div
                        className={`budget-tier-card ${activeBudgetTier === "budget" ? "selected" : ""}`}
                        onClick={() => handleSelectBudgetTier("budget")}
                      >
                        <div className="budget-card-symbol">$</div>
                        <h4>BUDGET</h4>
                        <p>Affordable options for cost-conscious travelers.</p>
                      </div>

                      <div
                        className={`budget-tier-card ${activeBudgetTier === "standard" ? "selected" : ""}`}
                        onClick={() => handleSelectBudgetTier("standard")}
                      >
                        <div className="budget-card-symbol">$$</div>
                        <h4>STANDARD</h4>
                        <p>Balanced comfort and value for money.</p>
                      </div>

                      <div
                        className={`budget-tier-card ${activeBudgetTier === "luxury" ? "selected" : ""}`}
                        onClick={() => handleSelectBudgetTier("luxury")}
                      >
                        <div className="budget-card-symbol">$$$</div>
                        <h4>LUXURY</h4>
                        <p>Premium experiences with top-class amenities.</p>
                      </div>
                    </div>

                    {/* Custom Budget Direct Input */}
                    <div className="dark-budget-input-wrap">
                      <span className="dark-currency-badge">LKR</span>
                      <input
                        type="number"
                        className="dark-input-field budget-num-input"
                        placeholder="e.g. 75000"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        required
                      />
                    </div>
                    {budget && Number(budget) > 0 && (
                      <p className="budget-insight-hint dark-budget-hint">
                        Suggested hotel allocation (40%): <strong>LKR {targetHotelBudget.toLocaleString()}</strong> (~LKR {Math.round(targetHotelBudget / Math.max(1, calculateNights())).toLocaleString()} / night)
                      </p>
                    )}
                  </div>

                  {/* Section 4: Who is traveling? (From Screenshot 3) */}
                  <div className="dark-form-section">
                    <div className="dark-section-title-row">
                      <span className="dark-section-bullet">•</span>
                      <h3 className="dark-section-title">WHO IS TRAVELING?</h3>
                    </div>

                    <div className="traveler-tier-cards-grid">
                      <div
                        className={`traveler-tier-card ${tripType === "Solo" ? "selected" : ""}`}
                        onClick={() => setTripType("Solo")}
                      >
                        <div className="traveler-card-icon purple">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                          </svg>
                        </div>
                        <h4>JUST ME</h4>
                      </div>

                      <div
                        className={`traveler-tier-card ${tripType === "Couple" ? "selected" : ""}`}
                        onClick={() => setTripType("Couple")}
                      >
                        <div className="traveler-card-icon indigo">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                          </svg>
                        </div>
                        <h4>COUPLE</h4>
                      </div>

                      <div
                        className={`traveler-tier-card ${tripType === "Family" ? "selected" : ""}`}
                        onClick={() => setTripType("Family")}
                      >
                        <div className="traveler-card-icon amber">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 4a3 3 0 100 6 3 3 0 000-6zm-6 8a2.5 2.5 0 100 5 2.5 2.5 0 000-5zm12 0a2.5 2.5 0 100 5 2.5 2.5 0 000-5zm-6 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                          </svg>
                        </div>
                        <h4>FAMILY</h4>
                      </div>

                      <div
                        className={`traveler-tier-card ${tripType === "Friends" ? "selected" : ""}`}
                        onClick={() => setTripType("Friends")}
                      >
                        <div className="traveler-card-icon coral">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M16.5 13c-1.2 0-3.07.34-4.5 1-1.43-.66-3.3-1-4.5-1C4.7 13 2 14.3 2 17v2h20v-2c0-2.7-2.7-4-5.5-4zM7.5 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm9 0c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3z" />
                          </svg>
                        </div>
                        <h4>FRIENDS</h4>
                      </div>
                    </div>

                    {/* Group Size Stepper when Family or Friends */}
                    {(tripType === "Family" || tripType === "Friends") && (
                      <div className="dark-group-size-box">
                        <label className="dark-micro-label">
                          {tripType === "Family" ? "FAMILY MEMBERS COUNT" : "FRIENDS COUNT"}
                        </label>
                        <div className="dark-stepper-wrap">
                          <button
                            type="button"
                            className="dark-stepper-btn"
                            onClick={() => setGroupSize((prev) => Math.max(3, (Number(prev) || 3) - 1))}
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min="3"
                            value={groupSize}
                            onChange={(e) => setGroupSize(Math.max(3, Number(e.target.value) || 3))}
                            className="dark-stepper-input"
                            required
                          />
                          <button
                            type="button"
                            className="dark-stepper-btn"
                            onClick={() => setGroupSize((prev) => (Number(prev) || 3) + 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </form>

                <WeatherAlert 
                  destination={destination}
                  startDate={startDate}
                  onSwitchDestination={(dest) => {
                    setDestination(dest);
                    setSelectedHotel(null);
                    setSelectedActivities([]);
                    setHotels([]);
                    setActivities([]);
                  }}
                />
              </div>

              {/* Right Column: Sticky Trip Summary (Screenshot 4) */}
              <div className="dark-summary-column">
                <div className="dark-trip-summary-card">
                  <div className="summary-watermark-globe">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                  </div>

                  <div className="summary-top-header">
                    <h3>TRIP SUMMARY</h3>
                    <div className="summary-title-line" />
                  </div>

                  <div className="summary-field-group">
                    <span className="summary-small-label">DESTINATION</span>
                    <strong className="summary-main-val">
                      {destination ? destination : "Destination not set"}
                    </strong>
                  </div>

                  <div className="summary-two-col-row">
                    <div className="summary-field-group">
                      <span className="summary-small-label">DURATION</span>
                      <span className="summary-sub-val">
                        {startDate && endDate ? `${calculateNights() + 1} Days` : "---"}
                      </span>
                    </div>

                    <div className="summary-field-group">
                      <span className="summary-small-label">GROUP</span>
                      <span className="summary-sub-val">
                        {tripType === "Solo" ? "Just Me" : tripType ? `${tripType}${tripType === "Couple" ? " (2)" : ` (${groupSize})`}` : "---"}
                      </span>
                    </div>
                  </div>

                  <div className="summary-field-group">
                    <span className="summary-small-label">BUDGET</span>
                    <span className="summary-sub-val budget-highlight">
                      {budget && Number(budget) > 0 ? `LKR ${Number(budget).toLocaleString()}` : "---"}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="summary-generate-btn"
                    onClick={handleContinueToHotels}
                  >
                    <span>GENERATE TRIP</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </button>


                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 2: HOTEL RECOMMENDATIONS ================= */}
        {step === 2 && (
          <div className="wizard-step-content dark-theme-step">
            <div className="dark-theme-header">
              <button
                type="button"
                className="theme-back-btn"
                onClick={() => setStep(1)}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                <span>BACK</span>
              </button>
              <p className="dark-step-bullet-label">• STEP 2 OF 3 • ACCOMMODATION</p>
              <h1 className="dark-main-title">
                Choose Your Stay in <span className="dark-title-accent">{destination}</span>
              </h1>
              <p className="dark-main-desc">
                Hotel recommendations matched to your <strong className="white-bold">LKR {Number(budget).toLocaleString()}</strong> budget for {nightsCount} night{nightsCount > 1 ? "s" : ""}.
              </p>
            </div>

            {/* Target accommodation budget banner */}
            <div className="hotel-budget-banner">
              <div>
                <span className="banner-title">Accommodation Allocation (40% of budget)</span>
                <strong>LKR {targetHotelBudget.toLocaleString()} Total</strong>
              </div>
              <div className="hotel-banner-right">
                <span className="banner-badge">~LKR {Math.round(targetHotelBudget / nightsCount).toLocaleString()} / night</span>
                {hotelsProvider === "gemini" ? (
                  <span className="api-badge gemini">Gemini AI Live</span>
                ) : hotelsProvider === "amadeus" ? (
                  <span className="api-badge live">Amadeus Live</span>
                ) : (
                  <span className="api-badge catalog">Curated Catalog</span>
                )}
              </div>
            </div>

            {/* Filter Chips */}
            <div className="filter-chips-container">
              {["All", "Luxury", "Comfort", "Budget"].map((tier) => (
                <button
                  type="button"
                  key={tier}
                  className={`filter-chip ${hotelTierFilter === tier ? "active" : ""}`}
                  onClick={() => setHotelTierFilter(tier)}
                >
                  {tier}
                </button>
              ))}
            </div>

            {/* Hotel Cards Grid or Loading Skeleton */}
            {hotelsLoading ? (
              <div className="hotels-loading-card">
                <div className="loading-spinner"></div>
                <h3>Checking hotel recommendations...</h3>
                <p>Retrieving available accommodation options for {destination}.</p>
              </div>
            ) : (
              <>
                <div className="hotel-cards-grid">
                  {filteredHotels.map((hotel) => {
                    const totalStayCost = hotel.pricePerNight * nightsCount;
                    const isSelected = selectedHotel?.id === hotel.id;

                    return (
                      <div
                        key={hotel.id}
                        className={`hotel-card ${isSelected ? "selected" : ""}`}
                        onClick={() => setSelectedHotel(hotel)}
                      >
                        {/* Interactive Google Preview Card */}
                        <div className="hotel-card-media-wrap">
                          <div className="card-google-embed-container" onClick={(e) => e.stopPropagation()}>
                            <iframe
                              title={`${hotel.name} - Google Preview`}
                              src={getGoogleMapsEmbedUrl(hotel.name, destination)}
                              className="card-google-iframe"
                              loading="lazy"
                              referrerPolicy="no-referrer-when-downgrade"
                            />
                          </div>
                        </div>

                        <div className="hotel-card-body">
                          <div className="hotel-card-badges-row">
                            <span className={`tier-badge ${(hotel.tier || "comfort").toLowerCase()}`}>{hotel.tier}</span>
                            {hotel.badge && <span className="badge-highlight">{hotel.badge}</span>}
                          </div>

                          <div className="hotel-title-row">
                            <h3>{hotel.name}</h3>
                            <a
                              href={getGooglePlaceSearchUrl(hotel.name, destination)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="card-google-ext-link"
                              title="Explore guest photos and reviews on Google Maps"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Google ↗
                            </a>
                          </div>
                          <div className="hotel-rating">
                            <span>Rating: {hotel.rating}</span>
                            <small>({hotel.reviews} reviews)</small>
                          </div>
                          <p className="hotel-desc">{hotel.description}</p>

                          {hotel.locationHighlights && (
                            <div className="hotel-card-highlight">
                              <span>{hotel.locationHighlights}</span>
                            </div>
                          )}

                          <div className="hotel-amenities">
                            {(hotel.amenities || []).slice(0, 4).map((amenity, i) => (
                              <span key={i} className="amenity-tag">{amenity}</span>
                            ))}
                            {(hotel.amenities || []).length > 4 && (
                              <span className="amenity-tag-more">+{hotel.amenities.length - 4} more</span>
                            )}
                          </div>
                        </div>

                        <div className="hotel-card-footer">
                          <div className="hotel-pricing">
                            <strong>LKR {hotel.pricePerNight.toLocaleString()}</strong>
                            <span>/ night • LKR {totalStayCost.toLocaleString()} ({nightsCount}n)</span>
                          </div>
                          <div className="hotel-card-actions">
                            <button
                              type="button"
                              className="view-details-btn"
                              title="View full hotel details, amenities and room description"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDetailHotel(hotel);
                              }}
                            >
                              Details ↗
                            </button>
                            <button
                              type="button"
                              className={`select-hotel-btn ${isSelected ? "selected" : ""}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedHotel(hotel);
                              }}
                            >
                              {isSelected ? "Selected" : "Select"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* See More Hotels Section */}
                <div className="see-more-hotels-container">
                  <button
                    type="button"
                    className="see-more-hotels-btn"
                    onClick={handleLoadMoreHotels}
                    disabled={loadingMoreHotels}
                  >
                    {loadingMoreHotels ? (
                      <>
                        <span className="mini-spinner"></span>
                        <span>Finding More Hotels with Gemini AI...</span>
                      </>
                    ) : (
                      <>
                        <span>Discover More Hotels in {destination}</span>
                        <small>(Adds 4 more authentic options)</small>
                      </>
                    )}
                  </button>

                  {loadMoreError && (
                    <p className="load-more-message">{loadMoreError}</p>
                  )}

                  <p className="hotels-count-badge">
                    Showing {filteredHotels.length} hotel{filteredHotels.length !== 1 ? "s" : ""}
                    {hotelsProvider === "gemini" && " • Powered by Gemini AI"}
                  </p>
                </div>
              </>
            )}

            {/* Wizard Navigation Buttons */}
            <div className="wizard-actions">
              <button
                type="button"
                className="wizard-back-button"
                onClick={() => setStep(1)}
              >
                ← Back to Details
              </button>
              <button
                type="button"
                className="wizard-next-button"
                onClick={handleContinueToActivities}
              >
                Continue to Activities ({selectedHotel ? selectedHotel.name.split(" ")[0] : "Choose Stay"}) →
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: REAL ACTIVITIES & EXPERIENCES ================= */}
        {step === 3 && (
          <div className="wizard-step-content">
            <div className="section-header-row">
              <p className="planner-label">STEP 3 OF 3 • REAL ACTIVITIES & EXPERIENCES</p>
              {activitiesProvider === "gemini" ? (
                <span className="api-badge gemini">Gemini AI Verified Experiences</span>
              ) : (
                <span className="api-badge catalog">Curated Experiences</span>
              )}
            </div>

            <h1>What would you like to do in {destination}?</h1>
            <p className="planner-description">
              Choose real, verified attractions, outdoor adventures, and cultural excursions in {destination} to include in your personalized itinerary.
            </p>

            {/* Selection counter banner */}
            <div className="activities-counter-banner">
              <div>
                <strong>{selectedActivities.length} Activities Selected</strong>
                <p>
                  Staying at <strong>{selectedHotel?.name}</strong> • {calculateNights() + 1} Days Trip
                </p>
              </div>
              <div className="activities-total-cost">
                <span>Admission / Activity Total</span>
                <strong>
                  LKR {selectedActivities.reduce((sum, a) => sum + (a.cost || 0), 0).toLocaleString()}
                </strong>
              </div>
            </div>

            {/* Dynamic Category Filter Chips */}
            <div className="filter-chips-container">
              {availableCategories.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  className={`filter-chip ${activityCategoryFilter === cat ? "active" : ""}`}
                  onClick={() => setActivityCategoryFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Activities Loading Card */}
            {activitiesLoading ? (
              <div className="hotels-loading-card activities-transition-loading-card">
                <div className="loading-spinner activities-transition-spinner"></div>
                <h3>Loading activities in {destination}...</h3>
                <p>Gathering the best experiences and attractions for your trip.</p>
              </div>
            ) : filteredActivities.length === 0 ? (
              <div className="empty-filter-notice">
                <p>No activities found in the "{activityCategoryFilter}" category.</p>
                <button
                  type="button"
                  className="filter-reset-btn"
                  onClick={() => setActivityCategoryFilter("All")}
                >
                  Show All Activities
                </button>
              </div>
            ) : (
              /* Real Activities Grid */
              <div className="activities-grid">
                {filteredActivities.map((activity) => {
                  const isSelected = selectedActivities.some((a) => a.id === activity.id);

                  return (
                    <div
                      key={activity.id}
                      className={`activity-selection-card ${isSelected ? "selected" : ""}`}
                      onClick={() => toggleActivity(activity)}
                    >
                      {/* Activity Photo Cover Banner */}
                      <div className="activity-card-hero">
                        <img
                          src={activity.image || getLocalActivityFallback(activity)}
                          alt={activity.title}
                          className="activity-card-img"
                          loading="lazy"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = getLocalActivityFallback(activity);
                          }}
                        />
                        <div className="activity-card-hero-overlay"></div>
                        <div className="activity-card-badges">
                          <span className={`activity-category-badge ${(activity.category || "sightseeing").toLowerCase()}`}>
                            {activity.category}
                          </span>
                          <span className="activity-slot-badge">
                            {activity.timeSlot} • {activity.duration}
                          </span>
                        </div>
                        <button
                          type="button"
                          className={`activity-toggle-btn ${isSelected ? "selected" : ""}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleActivity(activity);
                          }}
                          aria-label={isSelected ? "Remove activity" : "Add activity"}
                        >
                          {isSelected ? "✓" : "+"}
                        </button>
                      </div>

                      <div className="activity-card-content">
                        <div className="activity-title-row">
                          <h3>{activity.title}</h3>
                        </div>

                        {activity.location && (
                          <p className="activity-location-tag">{activity.location}</p>
                        )}

                        <p className="activity-desc-text">{activity.description}</p>

                        {activity.highlight && (
                          <div className="activity-insider-tip">
                            <span className="tip-badge">Tip</span>
                            <p>{activity.highlight}</p>
                          </div>
                        )}

                        <div className="activity-card-bottom">
                          <span className={`activity-cost-pill ${activity.cost === 0 ? "free" : ""}`}>
                            {activity.cost === 0 ? "Free Attraction" : `LKR ${Number(activity.cost).toLocaleString()}`}
                          </span>
                          <span className="selection-status">
                            {isSelected ? "Included in Itinerary" : "Add Experience +"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Discover More Real Activities via Gemini AI */}
            <div className="load-more-container">
              {loadMoreActivitiesError && (
                <div className="load-more-error-banner">
                  {loadMoreActivitiesError}
                </div>
              )}
              <button
                type="button"
                className="load-more-hotels-button"
                onClick={handleLoadMoreActivities}
                disabled={loadingMoreActivities || activitiesLoading}
              >
                {loadingMoreActivities ? (
                  <>
                    <span className="btn-spinner" />
                    Finding more activities in {destination}...
                  </>
                ) : (
                  <>
                    Discover More Activities in {destination}
                  </>
                )}
              </button>
            </div>

            {/* Itinerary Generation Loading */}
            {itineraryLoading && (
              <div className="hotels-loading-card itinerary-loading-card">
                <div className="loading-spinner itinerary-spinner"></div>
                <h3>Crafting your personalized itinerary...</h3>
                <p>Building your {selectedActivities.length}-experience adventure in {destination}.</p>
              </div>
            )}

            {/* Wizard Navigation Buttons */}
            <div className="wizard-actions">
              <button
                type="button"
                className="wizard-back-button"
                onClick={() => setStep(2)}
                disabled={itineraryLoading}
              >
                ← Back to Hotels
              </button>
              <button
                type="button"
                className="wizard-generate-button"
                onClick={handleGenerateItinerary}
                disabled={itineraryLoading}
              >
                {itineraryLoading
                  ? "Building Itinerary..."
                  : `Generate My Personalized Itinerary (${selectedActivities.length} Experiences)`}
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Hotel Detail Modal */}
      {activeDetailHotel && (
        <div className="hotel-modal-overlay" onClick={() => setActiveDetailHotel(null)}>
          <div className="hotel-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="hotel-modal-close"
              onClick={() => setActiveDetailHotel(null)}
              aria-label="Close modal"
            >
              ✕
            </button>

            {/* Interactive Mode Segmented Tabs */}
            <div className="modal-view-mode-tabs">
              <button
                type="button"
                className={`modal-tab-btn ${modalViewTab === "google" ? "active" : ""}`}
                onClick={() => setModalViewTab("google")}
                title="Interactive Google Map with Reviews & Place Card"
              >
                <span>Google Live Card & Reviews</span>
              </button>
              <button
                type="button"
                className={`modal-tab-btn ${modalViewTab === "directions" ? "active" : ""}`}
                onClick={() => setModalViewTab("directions")}
                title="Interactive Driving Route from Bandaranaike Airport"
              >
                <span>Live Directions from Airport</span>
              </button>
            </div>

            {/* Hero Hotel Display Banner (Google Maps Embed) */}
            <div className="hotel-modal-hero-wrap embed-mode">
              {modalViewTab === "directions" ? (
                <div className="modal-iframe-container">
                  <iframe
                    title={`${activeDetailHotel.name} Driving Directions`}
                    src={getGoogleDirectionsEmbedUrl(activeDetailHotel.name, destination)}
                    className="modal-google-iframe"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="modal-iframe-container">
                  <iframe
                    title={`${activeDetailHotel.name} Google Place Preview`}
                    src={getGoogleMapsEmbedUrl(activeDetailHotel.name, destination)}
                    className="modal-google-iframe"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                </div>
              )}
            </div>

            {/* Real Guest Photos & Google Navigation Action Bar */}
            <div className="modal-google-action-bar">
              <a
                href={getGooglePlaceSearchUrl(activeDetailHotel.name, destination)}
                target="_blank"
                rel="noopener noreferrer"
                className="google-action-btn guest-photos"
                title="View real photos uploaded by travelers on Google Maps"
              >
                <span>View Guest Photos on Google</span>
                <small>↗</small>
              </a>
              <a
                href={getGoogleDirectionsExternalUrl(activeDetailHotel.name, destination)}
                target="_blank"
                rel="noopener noreferrer"
                className="google-action-btn directions"
                title="Open GPS turn-by-turn navigation in Google Maps app"
              >
                <span>GPS Directions</span>
                <small>↗</small>
              </a>
            </div>

            <div className="hotel-modal-header-info">
              <div className="hotel-modal-badges-row">
                <span className={`tier-badge ${(activeDetailHotel.tier || "comfort").toLowerCase()}`}>
                  {activeDetailHotel.tier}
                </span>
                {activeDetailHotel.badge && (
                  <span className="badge-highlight">{activeDetailHotel.badge}</span>
                )}
                {hotelsProvider === "gemini" && (
                  <span className="api-badge gemini">Gemini AI Verified</span>
                )}
              </div>
              <h2>{activeDetailHotel.name}</h2>
              <div className="hotel-rating">
                <span>Rating: {activeDetailHotel.rating}</span>
                <small>({activeDetailHotel.reviews} reviews from verified guests)</small>
              </div>
            </div>

            <div className="hotel-modal-body">
              {activeDetailHotel.locationHighlights && (
                <div className="modal-highlight-row">
                  <span className="highlight-tag">LOCATION</span>
                  <div>
                    <strong>Location & Proximity</strong>
                    <p>{activeDetailHotel.locationHighlights}</p>
                  </div>
                </div>
              )}

              {activeDetailHotel.roomType && (
                <div className="modal-highlight-row room">
                  <span className="highlight-tag">ROOM</span>
                  <div>
                    <strong>Suggested Room Category</strong>
                    <p>{activeDetailHotel.roomType}</p>
                  </div>
                </div>
              )}

              <div className="modal-section">
                <h4>About this Accommodation</h4>
                <p className="modal-description">{activeDetailHotel.description}</p>
              </div>

              <div className="modal-pricing-breakdown">
                <div className="pricing-box">
                  <span className="pricing-tag">Nightly Rate</span>
                  <span className="pricing-value">LKR {activeDetailHotel.pricePerNight.toLocaleString()}</span>
                </div>
                <div className="pricing-math">× {nightsCount} night{nightsCount > 1 ? "s" : ""} =</div>
                <div className="pricing-box total">
                  <span className="pricing-tag">Estimated Stay Cost</span>
                  <span className="pricing-value">LKR {(activeDetailHotel.pricePerNight * nightsCount).toLocaleString()}</span>
                </div>
              </div>

              <div className="modal-section">
                <h4>Included Amenities & Perks</h4>
                <div className="modal-amenities-grid">
                  {(activeDetailHotel.amenities || []).map((amenity, idx) => (
                    <div key={idx} className="modal-amenity-chip">
                      <span className="modal-check">✓</span>
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="hotel-modal-footer">
              <button
                type="button"
                className="modal-cancel-btn"
                onClick={() => setActiveDetailHotel(null)}
              >
                Close
              </button>
              <button
                type="button"
                className={`modal-select-btn ${selectedHotel?.id === activeDetailHotel.id ? "selected" : ""}`}
                onClick={() => {
                  setSelectedHotel(activeDetailHotel);
                  setActiveDetailHotel(null);
                }}
              >
                {selectedHotel?.id === activeDetailHotel.id
                  ? "Selected Stay"
                  : "Select This Hotel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlanTrip;