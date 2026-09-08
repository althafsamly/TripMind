import { Link } from "react-router-dom";
import "./MyTrips.css";

function MyTrips() {
  const trips = [
  {
    id: 1,
    destination: "Ella",
    emoji: "🏔️",
    days: 4,
    budget: 85000,
    interests: "Nature, Hiking, Sightseeing",
    date: "August 2026",
  },
  {
    id: 2,
    destination: "Galle",
    emoji: "🌊",
    days: 3,
    budget: 65000,
    interests: "Beaches, History, Food",
    date: "July 2026",
  },
  {
    id: 3,
    destination: "Kandy",
    emoji: "🌿",
    days: 3,
    budget: 55000,
    interests: "Culture, Nature, Sightseeing",
    date: "June 2026",
  },
];

  return (
    <div className="my-trips-page">
      <div className="my-trips-container">

        <div className="my-trips-header">
          <div>
            <p className="page-label">YOUR ADVENTURES</p>
            <h1>My Trips</h1>
            <p>
              View your previously generated trips and revisit your travel
              plans.
            </p>
          </div>

          <Link to="/plan-trip" className="new-trip-button">
            + Plan New Trip
          </Link>
        </div>

        <div className="trips-grid">
          {trips.map((trip) => (
            <div className="saved-trip-card" key={trip.id}>

              <div className="saved-trip-image">
                <span>{trip.emoji}</span>

                <div className="trip-days-badge">
                  {trip.days} Days
                </div>
              </div>

              <div className="saved-trip-content">
                <p className="trip-date">{trip.date}</p>

                <h2>{trip.destination}</h2>

                <p className="trip-interests">
                  {trip.interests}
                </p>

                <div className="saved-trip-footer">
                  <div>
                    <span className="budget-label">
                      Budget
                    </span>

                    <strong>
                      LKR {trip.budget.toLocaleString()}
                    </strong>
                  </div>

                  <button className="view-trip-button">
                    View Trip →
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default MyTrips;