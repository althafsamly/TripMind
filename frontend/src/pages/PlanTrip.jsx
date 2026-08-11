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

  const navigate = useNavigate();

  function getTravelerCount() {
    if (tripType === "Solo") {
      return 1;
    }

    if (tripType === "Couple") {
      return 2;
    }

    return Number(groupSize);
  }

  function getSuggestedInterests() {
    return locationInterests[destination.trim().toLowerCase()] || [
      "Food",
      "Nature",
      "Culture",
      "Sightseeing",
    ];
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

    const days =
      Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

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

    navigate("/trip-result", {
      state: tripData,
    });
  }

  return (
    <div className="plan-trip-page">
      <div className="trip-form-card">
        <p className="planner-label">AI TRIP PLANNER</p>

        <h1>Plan Your Next Adventure</h1>

        <p className="planner-description">
          Tell TripMind AI about your Sri Lankan getaway and we'll create a
          personalized travel plan for you.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Destination</label>

            <input
              type="text"
              placeholder="e.g. Ella, Kandy, Galle, Nuwara Eliya"
              value={destination}
              onChange={(event) => {
                setDestination(event.target.value);
                setInterests([]);
              }}
              required
            />
          </div>

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

          <div className="form-group">
            <label>Budget (LKR)</label>

            <input
              type="number"
              placeholder="e.g. 75000"
              value={budget}
              onChange={(event) => setBudget(event.target.value)}
              required
            />
          </div>

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