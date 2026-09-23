import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getDestinationPhoto,
  getPexelsDestinationPhoto,
  getLocalDestinationFallback,
  getDestinationPhotos,
} from "../utils/activityImages";
import "./MyTrips.css";

function MyTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setIsLoggedIn(false);
      setLoading(false);
      return;
    }

    setIsLoggedIn(true);
    fetchTrips(token);
  }, []);

  async function fetchTrips(token) {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("http://localhost:5000/api/trips", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsLoggedIn(false);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch trips");
      }

      const data = await response.json();
      setTrips(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load your saved trips. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteTrip(tripId) {
    if (!window.confirm("Are you sure you want to remove this saved trip?")) {
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://localhost:5000/api/trips/${tripId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        alert("Failed to delete trip");
        return;
      }

      setTrips((prevTrips) => prevTrips.filter((t) => t._id !== tripId));
    } catch (err) {
      console.error(err);
      alert("Error deleting trip. Please try again.");
    }
  }

  function handleViewTrip(trip) {
    navigate("/trip-result", { state: trip });
  }

  return (
    <div className="my-trips-page">
      <div className="my-trips-container">
        <div className="my-trips-header">
          <div>
            <p className="page-label">YOUR ADVENTURES</p>
            <h1>My Trips</h1>
            <p>
              View your previously saved trips and revisit your personalized travel plans.
            </p>
          </div>

          {isLoggedIn && (
            <Link to="/plan-trip" className="new-trip-button">
              + Plan New Trip
            </Link>
          )}
        </div>

        {!isLoggedIn ? (
          <div className="my-trips-state-card">
            <div className="state-badge-pill">ACCOUNT REQUIRED</div>
            <h2>Sign in to view your trips</h2>
            <p>You need to be logged in with your TripMind AI account to view and manage saved trips.</p>
            <div className="state-actions">
              <Link to="/login" className="primary-button">
                Sign In
              </Link>
              <Link to="/register" className="secondary-button-outline">
                Create an Account
              </Link>
            </div>
          </div>
        ) : loading ? (
          <div className="my-trips-state-card">
            <div className="loading-spinner"></div>
            <h2>Loading your trips...</h2>
            <p>Gathering your saved itineraries from the cloud.</p>
          </div>
        ) : error ? (
          <div className="my-trips-state-card">
            <div className="state-badge-pill error">ERROR</div>
            <h2>{error}</h2>
            <button
              className="primary-button"
              onClick={() => fetchTrips(localStorage.getItem("token"))}
            >
              Retry
            </button>
          </div>
        ) : trips.length === 0 ? (
          <div className="my-trips-state-card">
            <div className="state-badge-pill">ITINERARIES</div>
            <h2>No saved trips yet</h2>
            <p>
              Explore Sri Lanka's beautiful destinations and save your custom itineraries here!
            </p>
            <Link to="/plan-trip" className="primary-button">
              Plan Your First Trip
            </Link>
          </div>
        ) : (
          <div className="trips-grid">
            {trips.map((trip) => (
              <div
                className="saved-trip-card"
                key={trip._id}
                role="button"
                tabIndex={0}
                onClick={() => handleViewTrip(trip)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleViewTrip(trip);
                  }
                }}
              >
                <div className="saved-trip-image">
                  <div className="saved-trip-photos-trio">
                    {getDestinationPhotos(trip.destination).map((photo, idx) => (
                      <div className="saved-trip-photo-pane" key={idx}>
                        <img
                          src={photo.url}
                          alt={`${trip.destination} - ${photo.caption}`}
                          loading="lazy"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = photo.fallback;
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="saved-trip-gradient-overlay"></div>
                  <div className="trip-days-badge">{trip.days} Days</div>
                  {trip.selectedHotel && (
                    <div className="trip-hotel-pill">
                      {trip.selectedHotel.name}
                    </div>
                  )}
                </div>

                <div className="saved-trip-content">
                  <p className="trip-date">
                    {trip.startDate && trip.endDate
                      ? `${trip.startDate} → ${trip.endDate}`
                      : "Flexible Dates"}
                  </p>

                  <h2>{trip.destination}</h2>

                  {trip.selectedHotel && (
                    <p className="trip-hotel-info">
                      Stay: {trip.selectedHotel.name} ({trip.selectedHotel.tier})
                    </p>
                  )}

                  <p className="trip-interests">
                    {trip.selectedActivities && trip.selectedActivities.length > 0
                      ? `${trip.selectedActivities.length} Activities • ${trip.tripType || "Solo"}`
                      : Array.isArray(trip.interests) && trip.interests.length > 0
                      ? trip.interests.join(", ")
                      : `${trip.tripType || "Solo"} Travel`}
                  </p>

                  <div className="saved-trip-footer">
                    <div>
                      <span className="budget-label">Budget</span>
                      <strong>
                        LKR {Number(trip.budget || 0).toLocaleString()}
                      </strong>
                    </div>

                    <div className="card-actions">
                      <button
                        className="view-trip-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewTrip(trip);
                        }}
                      >
                        View Trip →
                      </button>
                      <button
                        className="delete-trip-button"
                        title="Delete Trip"
                        aria-label="Delete Trip"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTrip(trip._id);
                        }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyTrips;