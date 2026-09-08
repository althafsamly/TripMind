import { useLocation, Link } from "react-router-dom";
import "./TripResult.css";

// Dynamic database for destination-specific Map, Food, and Vehicle data
const locationData = {
  mirissa: {
    coords: { lat: 5.9482, lng: 80.4716 },
    foodSpots: [
      { name: "Dewmini Roti Shop", type: "Roti & Kottu", specialty: "Famous cheese & avocado rotis" },
      { name: "Mirissa Catch Seafood", type: "Seafood Grill", specialty: "Fresh beachfront daily catch" },
      { name: "Mama's Dinner", type: "Rice & Curry", specialty: "Authentic local dinner buffet" },
    ],
    vehicles: [
      { type: "Scooter / Bike", rate: "Rs. 3,500/day", icon: "🛵", badge: "Best for Mirissa" },
      { type: "Self-Drive Tuk-Tuk", rate: "Rs. 6,000/day", icon: "🛺", badge: "Popular Choice" },
    ]
  },
  ella: {
    coords: { lat: 6.8667, lng: 81.0466 },
    foodSpots: [
      { name: "Matey Hut", type: "Local Eatery", specialty: "Traditional claypot rice & curry" },
      { name: "Downtown Roti Hut", type: "Street Food", specialty: "Kottu & hot snacks" },
      { name: "Chill Cafe", type: "Fusion & Local", specialty: "Lankan curries & scenic mountain view" },
    ],
    vehicles: [
      { type: "Scooter / Bike", rate: "Rs. 3,500/day", icon: "🛵", badge: "Best for Hills" },
      { type: "Private Car / Driver", rate: "Rs. 14,000/day", icon: "🚗", badge: "Long Distance" },
    ]
  },
  kandy: {
    coords: { lat: 7.2906, lng: 80.6337 },
    foodSpots: [
      { name: "Muslim Hotel", type: "Street Food Legend", specialty: "Authentic beef kottu & samosas" },
      { name: "Slightly Chilled Lounge", type: "Lankan & Views", specialty: "Curry with Kandy lake panorama" },
    ],
    vehicles: [
      { type: "Private Taxi / Car", rate: "Rs. 12,000/day", icon: "🚗", badge: "Comfortable" },
      { type: "Tuk-Tuk Rental", rate: "Rs. 5,000/day", icon: "🛺", badge: "Local Commute" },
    ]
  },
  galle: {
    coords: { lat: 6.0535, lng: 80.2210 },
    foodSpots: [
      { name: "Lucky Fort Restaurant", type: "Rice & Curry", specialty: "10-curry traditional set" },
      { name: "Poonie's Kitchen", type: "Healthy Local", specialty: "Organic salad bowls & fresh juices" },
    ],
    vehicles: [
      { type: "Scooter / Bike", rate: "Rs. 3,500/day", icon: "🛵", badge: "Fort Friendly" },
      { type: "Tuk-Tuk Rental", rate: "Rs. 5,500/day", icon: "🛺", badge: "Coastal Drives" },
    ]
  }
};

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

  // Fallback location lookup (defaults to Colombo coordinates if target destination isn't listed)
  const destKey = trip.destination ? trip.destination.toLowerCase().trim() : "";
  const currentDestData = locationData[destKey] || {
    coords: { lat: 6.9271, lng: 79.8612 },
    foodSpots: [
      { name: "Local Village Eatery", type: "Rice & Curry", specialty: "Authentic Sri Lankan buffet" },
      { name: "Night Market Kottu", type: "Street Food", specialty: "Freshly made hot kottu" },
    ],
    vehicles: [
      { type: "Scooter / Bike", rate: "Rs. 3,500/day", icon: "🛵", badge: "Easy Travel" },
      { type: "Self-Drive Tuk-Tuk", rate: "Rs. 6,000/day", icon: "🛺", badge: "Authentic" },
    ]
  };

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
            
            {/* Interactive Location Map */}
            <div className="result-card map-card">
              <div className="section-title">
                <p>EXPLORE LOCATION</p>
                <h2>Destination Map</h2>
              </div>
              <div className="map-wrapper">
                <iframe
                  title="Destination Map"
                  width="100%"
                  height="280"
                  style={{ border: 0, borderRadius: "14px" }}
                  loading="lazy"
                  src={`https://maps.google.com/maps?q=${currentDestData.coords.lat},${currentDestData.coords.lng}&z=13&output=embed`}
                />
              </div>
            </div>

            <div className="section-title" style={{ marginTop: "30px" }}>
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

            {/* Authentic Local Food Section */}
            <div className="result-card food-card" style={{ marginTop: "30px" }}>
              <div className="section-title">
                <p>LOCAL FLAVORS</p>
                <h2>Authentic Food Recommendations</h2>
              </div>
              <div className="food-list">
                {currentDestData.foodSpots.map((food, index) => (
                  <div key={index} className="food-spot-item">
                    <div className="food-icon">🍛</div>
                    <div className="food-info">
                      <strong>{food.name} <span className="food-type-tag">{food.type}</span></strong>
                      <p>{food.specialty}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </main>

          <aside className="result-sidebar">

            {/* Vehicle & Scooter Rentals Section */}
            <div className="result-card">
              <h3>Vehicle & Scooter Rentals</h3>
              <p className="rental-subtitle">Recommended options in {trip.destination}:</p>
              
              <div className="vehicle-rentals-list">
                {currentDestData.vehicles.map((v, index) => (
                  <div key={index} className="rental-item">
                    <span className="rental-icon">{v.icon}</span>
                    <div className="rental-details">
                      <strong>{v.type}</strong>
                      <p>{v.rate}</p>
                    </div>
                    <span className="rental-badge">{v.badge}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="result-card">
              <h3>Your Interests</h3>

              <div className="selected-interests">
                {trip.interests && trip.interests.length > 0 ? (
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