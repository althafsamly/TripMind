import { Link } from "react-router-dom";
import { getDestinationPhotos } from "../utils/activityImages";
import "./Home.css";

const SUGGESTED_TRIPS = [
  {
    destination: "Ella",
    region: "HILL COUNTRY",
    days: "4 Days",
    cost: "LKR 85,000",
    description: "Scenic train rides, waterfalls, mountain views and hiking trails.",
  },
  {
    destination: "Galle",
    region: "SOUTH COAST",
    days: "3 Days",
    cost: "LKR 65,000",
    description: "Historic streets, coastal views, great food and beautiful beaches.",
  },
  {
    destination: "Kandy",
    region: "CULTURAL CAPITAL",
    days: "3 Days",
    cost: "LKR 55,000",
    description: "Culture, temples, nature and the beauty of Sri Lanka's central hills.",
  },
];

function Home() {
  return (
    <div className="home-page">
      <section className="hero-section">
        <video
          className="hero-video"
          autoPlay
          loop
          muted
          playsInline
        >
        <source
          src="/videos/sri-lanka-hero.mp4"
          type="video/mp4"
       />
        </video>

      <div className="hero-video-overlay"></div>

  <div className="hero-content">
    <p className="hero-label">AI Powered Travel Planning</p>

    <h1>
      Plan smarter.
      <br />
      Travel better.
    </h1>

    <p className="hero-description">
      Tell us where you want to go in Sri Lanka, your budget, and your
      travel dates. TripMind AI creates a personalized itinerary,
      recommends hotels, and estimates your travel costs.
    </p>

    <div className="hero-buttons">
      <Link to="/plan-trip" className="primary-button">
        Plan My Trip
      </Link>

      <Link to="/my-trips" className="secondary-button">
        View My Trips
      </Link>
    </div>
  </div>
</section>

      <section className="featured-section">
        <div className="section-heading">
          <p>POPULAR GETAWAYS</p>
          <h2>Explore Sri Lanka</h2>
          <span>
            Discover some of the most loved destinations around the island.
          </span>
        </div>

        <div className="destination-grid">
          {SUGGESTED_TRIPS.map((dest) => {
            const photos = getDestinationPhotos(dest.destination);
            return (
              <div className="destination-card" key={dest.destination}>
                <div className="destination-photos-trio">
                  {photos.map((photo, idx) => (
                    <div className="destination-photo-panel" key={idx}>
                      <img
                        src={photo.url}
                        alt={`${dest.destination} - ${photo.caption}`}
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = photo.fallback;
                        }}
                      />
                      <div className="destination-photo-pill">
                        <span className="pill-dot"></span>
                        <span>{photo.caption}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="destination-overlay">
                  <p>{dest.region}</p>
                  <h3>{dest.destination}</h3>

                  <div className="destination-info">
                    <span>{dest.days}</span>
                    <span>{dest.cost}</span>
                  </div>

                  <p className="destination-description">{dest.description}</p>

                  <Link
                    to={`/plan-trip?destination=${encodeURIComponent(dest.destination)}`}
                    className="destination-plan-link"
                  >
                    Plan Trip to {dest.destination} →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="features-section">
        <div className="section-heading">
          <p>How it works</p>
          <h2>Your entire trip planned in seconds</h2>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-step">01</div>
            <h3>Choose your destination</h3>
            <p>
              Tell us where you want to go in Sri Lanka, your budget, and your
              travel dates.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-step">02</div>
            <h3>Generate with AI</h3>
            <p>
              Our AI creates a day-by-day itinerary based on your interests and
              travel preferences.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-step">03</div>
            <h3>Stay within budget</h3>
            <p>
              Compare estimated accommodation, food, transport and activity
              costs before travelling.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;