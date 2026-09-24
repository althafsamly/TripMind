import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { destinationCatalog, getDestinationData } from "../data/travelCatalog";
import {
  getActivityPhoto,
  getDestinationPhoto,
  getPexelsDestinationPhoto,
  getLocalActivityFallback,
} from "../utils/activityImages";
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
  async function handleProcessVoiceTranscript(rawText) {
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
          if (data.plan.voiceConfirmation) {
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
      if (localPlan.voiceConfirmation) {
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
        recognitionRef.current = null;
        const textToProcess = (voiceTranscriptRef.current || "").trim();
        if (textToProcess.length >= 3) {
          handleProcessVoiceTranscript(textToProcess);
        } else {
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
    handleProcessVoiceTranscript(samplePrompt);
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
    e.preventDefault();
    if (weatherLoading) {
      alert("Please wait while we finish analyzing weather and seasonal advisories for your destination.");
      return;
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

    navigate("/trip-result", { state: tripData });
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
          <div className="wizard-step-content">
            <p className="planner-label">STEP 1 OF 3 • YOUR PREFERENCES</p>
            <h1>Plan Your Sri Lankan Adventure</h1>
            <p className="planner-description">
              Tell TripMind AI where you're heading and your budget, or use our Voice AI assistant to speak naturally.
            </p>

            {/* Comprehensive Voice AI Planner Assistant */}
            <div className="voice-planner-card">
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
                    handleProcessVoiceTranscript(textInputPrompt);
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

            <form onSubmit={handleContinueToHotels} className={`trip-form ${highlightFields ? "highlight-applied" : ""}`}>
              {/* Destination */}
              <div className="form-group">
                <label>Destination in Sri Lanka</label>
                <input
                  type="text"
                  placeholder="e.g. Ella, Kandy, Galle, Mirissa, Sigiriya, Nuwara Eliya"
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
              </div>

              {/* Travel Dates */}
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Weather, Monsoon & Natural Disaster Advisory */}
              {destination.trim() && startDate && endDate && (
                <div className="weather-advisory-container">
                  {weatherLoading ? (
                    <div className="weather-advisory-box loading" role="status" aria-live="polite">
                      <div className="weather-spinner-wrapper">
                        <div className="weather-spinner" />
                      </div>
                      <div className="weather-loading-text">
                        <h4>Analyzing Weather & Seasonal Advisory</h4>
                        <p>
                          Checking climate, monsoon patterns, and rainfall conditions for <strong>{destination}</strong> in <strong>{getMonthNameFromDate(startDate)}</strong>...
                        </p>
                      </div>
                    </div>
                  ) : weatherAdvisory ? (
                    weatherAdvisory.hasAdvisory ? (
                      <div className={`weather-advisory-box alert-${weatherAdvisory.level || "warning"}`}>
                        <div className="weather-advisory-header">
                          <div className="weather-icon-badge warning">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                              <line x1="12" y1="9" x2="12" y2="13" />
                              <line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                          </div>
                          <div className="weather-title-wrap">
                            <div className="weather-badge-row">
                              <span className="weather-status-badge warning">{weatherAdvisory.badge || "Weather Advisory"}</span>
                              {weatherAdvisory.season && (
                                <span className="weather-season-pill">{weatherAdvisory.season}</span>
                              )}
                              <span className="weather-month-pill">{weatherAdvisory.monthName}</span>
                            </div>
                            <h4 className="weather-headline">{weatherAdvisory.headline}</h4>
                          </div>
                        </div>

                        <p className="weather-summary-text">{weatherAdvisory.summary}</p>

                        {weatherAdvisory.risks && weatherAdvisory.risks.length > 0 && (
                          <div className="weather-risks-section">
                            <span className="weather-risks-title">Noted Weather Factors:</span>
                            <ul className="weather-risks-list">
                              {weatherAdvisory.risks.map((risk, idx) => (
                                <li key={idx}>
                                  <span className="risk-dot" />
                                  <span>{risk}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {weatherAdvisory.suggestedAlternates && weatherAdvisory.suggestedAlternates.length > 0 && (
                          <div className="weather-alternates-section">
                            <div className="alternates-header">
                              <h5>Recommended Favorable Alternatives for {weatherAdvisory.monthName}:</h5>
                              <span className="alternates-hint">Better weather & active season during these dates</span>
                            </div>
                            <div className="weather-alternates-grid">
                              {weatherAdvisory.suggestedAlternates.map((alt) => (
                                <div key={alt.destination} className="alternate-card">
                                  <div className="alt-card-body">
                                    <div className="alt-title-row">
                                      <strong>{alt.destination}</strong>
                                      {alt.region && <span className="alt-region-tag">{alt.region}</span>}
                                    </div>
                                    <p className="alt-reason">{alt.reason}</p>
                                    {alt.bestFor && <span className="alt-best-for">{alt.bestFor}</span>}
                                  </div>
                                  <button
                                    type="button"
                                    className="alt-switch-button"
                                    onClick={() => handleSelectAlternateDestination(alt.destination)}
                                    title={`Switch destination to ${alt.destination}`}
                                  >
                                    Switch to {alt.destination} →
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className={`advisory-ack-container ${advisoryAcknowledged ? "acknowledged" : "pending"}`}>
                          <label className="advisory-ack-checkbox-label">
                            <input
                              type="checkbox"
                              checked={advisoryAcknowledged}
                              onChange={(e) => setAdvisoryAcknowledged(e.target.checked)}
                            />
                            <span>
                              I acknowledge the weather advisory for {destination} in {weatherAdvisory.monthName} and choose to proceed with this itinerary.
                            </span>
                          </label>
                          {!advisoryAcknowledged && (
                            <span className="advisory-unlock-hint">Check this box to accept and unlock the Continue button</span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="weather-advisory-box favorable">
                        <div className="weather-advisory-header">
                          <div className="weather-icon-badge favorable">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                              <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                          </div>
                          <div className="weather-title-wrap">
                            <div className="weather-badge-row">
                              <span className="weather-status-badge favorable">{weatherAdvisory.badge || "Favorable Weather"}</span>
                              {weatherAdvisory.season && (
                                <span className="weather-season-pill favorable">{weatherAdvisory.season}</span>
                              )}
                              <span className="weather-month-pill favorable">{weatherAdvisory.monthName}</span>
                            </div>
                            <h4 className="weather-headline">{weatherAdvisory.headline}</h4>
                          </div>
                        </div>
                        <p className="weather-summary-text favorable">{weatherAdvisory.summary}</p>
                      </div>
                    )
                  ) : null}
                </div>
              )}

              {/* Total Budget */}
              <div className="form-group">
                <label>Total Budget (LKR)</label>
                <input
                  type="number"
                  placeholder="e.g. 75000"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  required
                />
                {budget && Number(budget) > 0 && (
                  <p className="budget-insight-hint">
                    Suggested hotel budget (40%): <strong>LKR {targetHotelBudget.toLocaleString()}</strong> (~LKR {Math.round(targetHotelBudget / Math.max(1, calculateNights())).toLocaleString()} / night)
                  </p>
                )}
              </div>

              {/* Travel Group */}
              <div className="form-group">
                <label>Who are you travelling with?</label>
                <div className="trip-type-options">
                  {["Solo", "Couple", "Family", "Friends"].map((type) => (
                    <button
                      type="button"
                      key={type}
                      className={tripType === type ? "trip-type-button active" : "trip-type-button"}
                      onClick={() => setTripType(type)}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Group Size */}
              {(tripType === "Family" || tripType === "Friends") && (
                <div className="form-group group-size-section">
                  <label>
                    {tripType === "Family" ? "Family Members Count" : "Friends Count"}
                  </label>
                  <input
                    type="number"
                    min="3"
                    value={groupSize}
                    onChange={(e) => setGroupSize(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="wizard-actions step-1-actions">
                <button
                  className={`wizard-next-button ${weatherLoading ? "loading" : ""} ${weatherAdvisory?.hasAdvisory && !advisoryAcknowledged ? "faded-advisory" : ""}`}
                  type="submit"
                  disabled={
                    weatherLoading ||
                    !destination.trim() ||
                    !startDate ||
                    !endDate ||
                    (weatherAdvisory?.hasAdvisory && !advisoryAcknowledged)
                  }
                  title={
                    weatherLoading
                      ? "Analyzing weather conditions, please wait..."
                      : weatherAdvisory?.hasAdvisory && !advisoryAcknowledged
                      ? "Accept the weather advisory above to unlock and continue"
                      : "Continue to Hotels"
                  }
                >
                  {weatherLoading ? (
                    <>
                      <span className="mini-spinner white"></span>
                      <span>Checking Weather Advisory...</span>
                    </>
                  ) : weatherAdvisory?.hasAdvisory && !advisoryAcknowledged ? (
                    "Accept Weather Advisory to Continue →"
                  ) : (
                    "Continue to Hotels →"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================= STEP 2: HOTEL RECOMMENDATIONS ================= */}
        {step === 2 && (
          <div className="wizard-step-content">
            <p className="planner-label">STEP 2 OF 3 • ACCOMMODATION</p>
            <h1>Choose Your Stay in {destination}</h1>
            <p className="planner-description">
              Hotel recommendations matched to your <strong>LKR {Number(budget).toLocaleString()}</strong> budget for {nightsCount} night{nightsCount > 1 ? "s" : ""}.
            </p>

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

            {/* Skeleton Loading State */}
            {activitiesLoading ? (
              <div className="activities-grid">
                {[1, 2, 3, 4, 5, 6].map((sk) => (
                  <div key={sk} className="activity-selection-card activity-skeleton-card">
                    <div className="activity-skeleton-img shimmer" />
                    <div className="activity-skeleton-body">
                      <div className="skeleton-line title shimmer" />
                      <div className="skeleton-line text shimmer" />
                      <div className="skeleton-line tip shimmer" />
                      <div className="skeleton-line bottom shimmer" />
                    </div>
                  </div>
                ))}
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

            {/* Wizard Navigation Buttons */}
            <div className="wizard-actions">
              <button
                type="button"
                className="wizard-back-button"
                onClick={() => setStep(2)}
              >
                ← Back to Hotels
              </button>
              <button
                type="button"
                className="wizard-generate-button"
                onClick={handleGenerateItinerary}
              >
                Generate My Personalized Itinerary ({selectedActivities.length} Experiences)
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