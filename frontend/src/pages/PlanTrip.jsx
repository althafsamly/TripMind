import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const [destination, setDestination] = useState("");
  const [budget, setBudget] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [tripType, setTripType] = useState("Solo");
  const [groupSize, setGroupSize] = useState(3);
  const [interests, setInterests] = useState([]);

  // Voice AI States
  const [isListening, setIsListening] = useState(false);
  const [transcriptText, setTranscriptText] = useState("");

  const navigate = useNavigate();

  // Smart Parser for Voice AI
  function parseAndFillForm(speechText) {
    const text = speechText.toLowerCase();

    // 1. Extract Destination
    const knownDestinations = Object.keys(locationInterests);
    const foundDestination = knownDestinations.find((loc) => text.includes(loc));
    if (foundDestination) {
      setDestination(foundDestination.charAt(0).toUpperCase() + foundDestination.slice(1));
    }

    // 2. Extract Budget
    const budgetMatch = text.match(/(\d+[\d,]*\d+|\d+\s*k)/i);
    if (budgetMatch) {
      let rawBudget = budgetMatch[0].replace(/,/g, "");
      if (rawBudget.toLowerCase().endsWith("k")) {
        rawBudget = parseFloat(rawBudget) * 1000;
      }
      setBudget(rawBudget.toString());
    }

    // 3. Extract Trip Type & Group Size
    if (text.includes("girlfriend") || text.includes("boyfriend") || text.includes("couple") || text.includes("partner")) {
      setTripType("Couple");
    } else if (text.includes("family")) {
      setTripType("Family");
    } else if (text.includes("friends") || text.includes("group")) {
      setTripType("Friends");
      const numMatch = text.match(/(\d+)\s*(people|friends|members|persons)/);
      if (numMatch) setGroupSize(numMatch[1]);
    } else if (text.includes("alone") || text.includes("solo")) {
      setTripType("Solo");
    }

    // 4. Extract Duration
    const daysMatch = text.match(/(\d+)\s*(days|day|night|nights)/);
    const today = new Date();
    const startStr = today.toISOString().split("T")[0];
    setStartDate(startStr);

    if (daysMatch) {
      const numDays = parseInt(daysMatch[1]);
      const calculatedEnd = new Date(today);
      calculatedEnd.setDate(today.getDate() + numDays - 1);
      setEndDate(calculatedEnd.toISOString().split("T")[0]);
    } else {
      setEndDate(startStr);
    }

    // 5. Extract Interests
    const availableInterests = foundDestination 
      ? locationInterests[foundDestination] 
      : ["Beaches", "Whale Watching", "Nature", "Hiking", "History", "Culture", "Sightseeing", "Relaxation"];

    const matchedInterests = availableInterests.filter((interest) =>
      text.includes(interest.toLowerCase())
    );

    if (matchedInterests.length > 0) {
      setInterests(matchedInterests);
    }
  }

  function handleGlobalVoiceInput() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice input is not supported in your browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.start();
    setIsListening(true);
    setTranscriptText("Listening... Speak your trip details naturally.");

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      setTranscriptText(`"${speechToText}"`);
      parseAndFillForm(speechToText);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setTranscriptText("Could not process voice input. Please try again.");
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);
  }

  function getTravelerCount() {
    if (tripType === "Solo") return 1;
    if (tripType === "Couple") return 2;
    return Number(groupSize);
  }

  function getSuggestedInterests() {
    return (
      locationInterests[destination.trim().toLowerCase()] || [
        "Food",
        "Nature",
        "Culture",
        "Sightseeing",
      ]
    );
  }

  function toggleInterest(interest) {
    if (interests.includes(interest)) {
      setInterests(interests.filter((item) => item !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const tripData = {
      destination,
      budget,
      startDate,
      endDate,
      days,
      travelers: getTravelerCount(),
      tripType,
      interests,
    };

    navigate("/trip-result", { state: tripData });
  }

  return (
    <div className="plan-trip-page">
      <div className="trip-form-card">
        <p className="planner-label">AI TRIP PLANNER</p>

        <h1>Plan Your Next Adventure</h1>

        <p className="planner-description">
          Tell TripMind AI about your Sri Lankan getaway or click the button below to speak your trip naturally!
        </p>

        {/* Global Voice AI Banner */}
        <div className="voice-ai-banner">
          <button
            type="button"
            className={`global-voice-button ${isListening ? "listening" : ""}`}
            onClick={handleGlobalVoiceInput}
          >
            {isListening ? "🎙️ Listening to your plan..." : "🎤 Fill Form with Voice AI"}
          </button>
          {transcriptText && <p className="voice-transcript">{transcriptText}</p>}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Destination */}
          <div className="form-group">
            <label>Destination</label>
            <input
              type="text"
              placeholder="e.g. Ella, Kandy, Galle, Mirissa"
              value={destination}
              onChange={(event) => {
                setDestination(event.target.value);
                setInterests([]);
              }}
              required
            />
          </div>

          {/* Dates */}
          <div className="form-row">
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>End Date</label>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(event) => setEndDate(event.target.value)}
                required
              />
            </div>
          </div>

          {/* Budget */}
          <div className="form-group">
            <label>Budget (LKR)</label>
            <input
              type="number"
              placeholder="e.g. 80000"
              value={budget}
              onChange={(event) => setBudget(event.target.value)}
              required
            />
          </div>

          {/* Trip Type */}
          <div className="form-group">
            <label>Who are you travelling with?</label>
            <div className="trip-type-options">
              {["Solo", "Couple", "Family", "Friends"].map((type) => (
                <button
                  type="button"
                  key={type}
                  className={
                    tripType === type
                      ? "trip-type-button active"
                      : "trip-type-button"
                  }
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
                {tripType === "Family"
                  ? "How many family members?"
                  : "How many friends?"}
              </label>
              <input
                type="number"
                min="3"
                value={groupSize}
                onChange={(event) => setGroupSize(event.target.value)}
                required
              />
            </div>
          )}

          {/* Interests */}
          <div className="form-group">
            <label>What are you interested in?</label>
            <p className="interest-hint">
              Suggested based on {destination || "your destination"}
            </p>
            <div className="interest-options">
              {getSuggestedInterests().map((interest) => (
                <button
                  type="button"
                  key={interest}
                  className={
                    interests.includes(interest)
                      ? "interest-chip active"
                      : "interest-chip"
                  }
                  onClick={() => toggleInterest(interest)}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          <button className="generate-button" type="submit">
            ✨ Generate My Trip
          </button>
        </form>
      </div>
    </div>
  );
}

export default PlanTrip;