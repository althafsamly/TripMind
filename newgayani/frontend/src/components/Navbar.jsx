import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("token");
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch (e) {
    user = null;
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        TripMind AI
      </Link>

      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/plan-trip">Plan Trip</Link>
        <Link to="/my-trips">My Trips</Link>

        {token ? (
          <div className="user-nav-actions">
            <span className="nav-user-greeting">
              👤 {user?.name ? user.name.split(" ")[0] : "Traveler"}
            </span>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register" className="register-link">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;