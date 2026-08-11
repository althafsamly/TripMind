import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Auth.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  async function handleLogin(event) {
    event.preventDefault();

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/my-trips");
    } catch (error) {
      console.error(error);
      setMessage("Could not connect to server");
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">

        <div className="auth-heading">
          <h1>Welcome back</h1>

          <p>
            Sign in to continue planning with TripMind AI.
          </p>
        </div>

        <div className="auth-card">

          <form onSubmit={handleLogin}>

            <div className="auth-form-group">
              <label>Email Address</label>

              <input
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="auth-form-group">
              <label>Password</label>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            <button className="auth-button" type="submit">
              Sign In
            </button>

          </form>

          {message && (
            <p className="auth-message">{message}</p>
          )}

          <div className="auth-switch">
            Don't have an account?{" "}
            <Link to="/register">Create one</Link>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Login;