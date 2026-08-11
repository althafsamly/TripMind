import { useState } from "react";
import { Link } from "react-router-dom";
import "./Auth.css";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleRegister(event) {
    event.preventDefault();

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
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

      setMessage("Account created successfully!");

      setName("");
      setEmail("");
      setPassword("");
    } catch (error) {
      console.error(error);
      setMessage("Could not connect to server");
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">

        <div className="auth-heading">
          <h1>Create your account</h1>
          <p>
            Join TripMind AI and start planning unforgettable trips.
          </p>
        </div>

        <div className="auth-card">
          <form onSubmit={handleRegister}>

            <div className="auth-form-group">
              <label>Full Name</label>

              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>

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
                placeholder="Create a password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            <button className="auth-button" type="submit">
              Create Account
            </button>

          </form>

          {message && (
            <p className="auth-message">{message}</p>
          )}

          <div className="auth-switch">
            Already have an account?{" "}
            <Link to="/login">Sign in</Link>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Register;