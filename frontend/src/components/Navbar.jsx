import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        TripMind AI
      </Link>

      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/plan-trip">Plan Trip</Link>
        <Link to="/my-trips">My Trips</Link>
        <Link to="/login">Login</Link>
        <Link to="/register" className="register-link">
          Register
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;