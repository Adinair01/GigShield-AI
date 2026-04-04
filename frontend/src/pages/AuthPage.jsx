import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

const CITIES = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad", "Kolkata", "Pune"];
const PLATFORMS = ["Swiggy", "Zomato", "Amazon", "Flipkart", "Dunzo", "BigBasket"];

export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form fields
  const [email, setEmail] = useState("raj@earnshield.demo");
  const [password, setPassword] = useState("password123");
  const [name, setName] = useState("");
  const [city, setCity] = useState("Mumbai");
  const [platform, setPlatform] = useState("Swiggy");
  const [income, setIncome] = useState(500);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register({
          name,
          email,
          password,
          city,
          platform,
          avg_daily_income: Number(income),
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h1>Earn Shield AI</h1>
        <p className="subtitle">
          AI-powered parametric insurance for India's gig workers
        </p>

        <div className="auth-toggle">
          <button
            className={mode === "login" ? "active" : ""}
            onClick={() => { setMode("login"); setError(""); }}
          >
            Login
          </button>
          <button
            className={mode === "register" ? "active" : ""}
            onClick={() => { setMode("register"); setError(""); }}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <div className="form-group">
              <label>Full Name</label>
              <input
                className="form-input"
                type="text"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              className="form-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {mode === "register" && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <select
                    className="form-select"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  >
                    {CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Platform</label>
                  <select
                    className="form-select"
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                  >
                    {PLATFORMS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Avg Daily Income (₹)</label>
                <input
                  className="form-input"
                  type="number"
                  min="100"
                  max="5000"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                />
              </div>
            </>
          )}

          {error && <p className="error-text">{error}</p>}

          <div className="form-group" style={{ marginTop: 8 }}>
            <button
              className="btn btn-primary"
              style={{ width: "100%" }}
              disabled={loading}
              type="submit"
            >
              {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </div>

          {mode === "login" && (
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 12, textAlign: "center" }}>
              Demo: raj@earnshield.demo / password123 (Worker)
              <br />
              admin@earnshield.demo / password123 (Admin)
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
