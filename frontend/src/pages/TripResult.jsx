import { useLocation, Link } from "react-router-dom";
import "./TripResult.css";

function TripResult() {
  const location = useLocation();
  const trip = location.state;

  if (!trip) {
    return (
      <div className="no-trip">
        <h2>No trip generated yet</h2>
        <Link to="/plan-trip">Plan a Trip</Link>
      </div>
    );
  }

  const itinerary = [
    {
      day: 1,
      title: "Arrival & Local Exploration",
      morning: "Arrive and check into your accommodation",
      afternoon: "Explore popular local attractions and viewpoints",
      evening: "Enjoy dinner at a recommended local restaurant",
    },
    {
      day: 2,
      title: "Culture & Adventure",
      morning: "Visit cultural and historical attractions",
      afternoon: "Experience nature and outdoor activities",
      evening: "Explore the town and try local cuisine",
    },
    {
      day: 3,
      title: "Hidden Gems & Relaxation",
      morning: "Visit scenic locations and hidden gems",
      afternoon: "Shopping, cafés and free exploration",
      evening: "Relax and enjoy your final evening",
    },
  ];

  const estimatedBudget = Number(trip.budget);

  const hotelBudget = Math.round(estimatedBudget * 0.4);
  const foodBudget = Math.round(estimatedBudget * 0.25);
  const transportBudget = Math.round(estimatedBudget * 0.2);
  const activityBudget = Math.round(estimatedBudget * 0.15);

  return (
    <div className="trip-result-page">
      <div className="result-container">

        <section className="result-hero">
          <p className="result-label">YOUR AI-GENERATED TRIP</p>

          <h1>{trip.destination}</h1>

          <p className="result-subtitle">
            A personalized {trip.days}-day Sri Lankan adventure created by
            TripMind AI.
          </p>

          <div className="trip-summary">
            <div>
              <span>📅</span>
              <strong>{trip.days} Days</strong>
              <p>
                {trip.startDate} → {trip.endDate}
              </p>
            </div>

            <div>
              <span>👥</span>
              <strong>{trip.travelers} Traveler(s)</strong>
              <p>{trip.tripType} Trip</p>
            </div>

            <div>
              <span>💰</span>
              <strong>
                LKR {Number(trip.budget).toLocaleString()}
              </strong>
              <p>Total Budget</p>
            </div>
          </div>
        </section>

        <div className="result-layout">

          <main className="itinerary-section">
            <div className="section-title">
              <p>PERSONALIZED FOR YOU</p>
              <h2>Your Itinerary</h2>
            </div>

            {itinerary.map((item) => (
              <div className="day-card" key={item.day}>
                <div className="day-number">
                  Day {item.day}
                </div>

                <div className="day-content">
                  <h3>{item.title}</h3>

                  <div className="activity">
                    <span>🌅</span>
                    <div>
                      <strong>Morning</strong>
                      <p>{item.morning}</p>
                    </div>
                  </div>

                  <div className="activity">
                    <span>☀️</span>
                    <div>
                      <strong>Afternoon</strong>
                      <p>{item.afternoon}</p>
                    </div>
                  </div>

                  <div className="activity">
                    <span>🌙</span>
                    <div>
                      <strong>Evening</strong>
                      <p>{item.evening}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </main>

          <aside className="result-sidebar">

            <div className="result-card">
              <h3>Your Interests</h3>

              <div className="selected-interests">
                {trip.interests.length > 0 ? (
                  trip.interests.map((interest) => (
                    <span key={interest}>
                      {interest}
                    </span>
                  ))
                ) : (
                  <p>No specific interests selected.</p>
                )}
              </div>
            </div>

            <div className="result-card">
              <h3>Estimated Budget</h3>

              <div className="budget-item">
                <span>🏨 Accommodation</span>
                <strong>
                  LKR {hotelBudget.toLocaleString()}
                </strong>
              </div>

              <div className="budget-item">
                <span>🍛 Food</span>
                <strong>
                  LKR {foodBudget.toLocaleString()}
                </strong>
              </div>

              <div className="budget-item">
                <span>🚗 Transport</span>
                <strong>
                  LKR {transportBudget.toLocaleString()}
                </strong>
              </div>

              <div className="budget-item">
                <span>🎟️ Activities</span>
                <strong>
                  LKR {activityBudget.toLocaleString()}
                </strong>
              </div>

              <div className="budget-total">
                <span>Estimated Total</span>
                <strong>
                  LKR {estimatedBudget.toLocaleString()}
                </strong>
              </div>
            </div>

            <div className="result-card">
              <h3>Recommended Stay</h3>

              <div className="hotel-preview">
                <div className="hotel-icon">🏨</div>

                <div>
                  <strong>Recommended Hotel</strong>
                  <p>Comfortable stay near {trip.destination}</p>
                  <span>★★★★☆</span>
                </div>
              </div>

              <button className="hotel-button">
                View Hotels
              </button>
            </div>

            <button className="save-trip-button">
              ♡ Save This Trip
            </button>

          </aside>
        </div>

        <div className="plan-another">
          <Link to="/plan-trip">
            ← Plan Another Trip
          </Link>
        </div>

      </div>
    </div>
  );
}

export default TripResult;