import { Link } from "react-router-dom";
import "./Home.css";

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
          <div
            className="destination-card"
          >
            <div className="destination-overlay">
              <p>HILL COUNTRY</p>
              <h3>Ella</h3>

              <div className="destination-info">
                <span>📅 4 Days</span>
                <span>💰 LKR 85,000</span>
              </div>

              <p className="destination-description">
                Scenic train rides, waterfalls, mountain views and hiking
                trails.
              </p>
            </div>
          </div>

          <div
            className="destination-card"
          >
            <div className="destination-overlay">
              <p>SOUTH COAST</p>
              <h3>Galle</h3>

              <div className="destination-info">
                <span>📅 3 Days</span>
                <span>💰 LKR 65,000</span>
              </div>

              <p className="destination-description">
                Historic streets, coastal views, great food and beautiful
                beaches.
              </p>
            </div>
          </div>

          <div
            className="destination-card"
          >
            <div className="destination-overlay">
              <p>CULTURAL CAPITAL</p>
              <h3>Kandy</h3>

              <div className="destination-info">
                <span>📅 3 Days</span>
                <span>💰 LKR 55,000</span>
              </div>

              <p className="destination-description">
                Culture, temples, nature and the beauty of Sri Lanka's central
                hills.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="section-heading">
          <p>How it works</p>
          <h2>Your entire trip planned in seconds</h2>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📍</div>
            <h3>Choose your destination</h3>
            <p>
              Tell us where you want to go in Sri Lanka, your budget, and your
              travel dates.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">✨</div>
            <h3>Generate with AI</h3>
            <p>
              Our AI creates a day-by-day itinerary based on your interests and
              travel preferences.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🏨</div>
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