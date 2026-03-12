import React, { useState } from "react";
import { registerUser, loginUser } from "../services/api.js";

function Register({ onAuthenticated }) {
  const [mode, setMode] = useState("register"); // register | login
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    platform: "Swiggy",
    city: "Mumbai",
    zone: "MUM-ANDHERI",
    avg_daily_income: 800,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload =
        mode === "register"
          ? form
          : { email: form.email, password: form.password };

      const fn = mode === "register" ? registerUser : loginUser;
      const data = await fn(payload);
      onAuthenticated(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <h1>
          Income protection for
          <br />
          India&apos;s delivery workers.
        </h1>
        <p className="auth-subtitle">
          GigShield AI watches live weather, pollution and curfews and
          auto-triggers payouts when your income is at risk. No forms. No
          follow-ups.
        </p>

        <div className="pill-toggle">
          <button
            className={mode === "register" ? "pill active" : "pill"}
            onClick={() => setMode("register")}
          >
            New worker
          </button>
          <button
            className={mode === "login" ? "pill active" : "pill"}
            onClick={() => setMode("login")}
          >
            Existing worker / admin
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === "register" && (
            <input
              name="name"
              placeholder="Full name"
              value={form.name}
              onChange={handleChange}
              required
            />
          )}

          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />

          {mode === "register" && (
            <>
              <div className="field-row">
                <select
                  name="platform"
                  value={form.platform}
                  onChange={handleChange}
                >
                  <option value="Swiggy">Swiggy</option>
                  <option value="Zomato">Zomato</option>
                  <option value="Amazon">Amazon</option>
                </select>
                <select name="city" value={form.city} onChange={handleChange}>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Delhi">Delhi</option>
                </select>
              </div>

              <input
                name="zone"
                placeholder="Zone / locality (e.g. MUM-ANDHERI)"
                value={form.zone}
                onChange={handleChange}
                required
              />

              <input
                name="avg_daily_income"
                type="number"
                placeholder="Average daily income (₹)"
                value={form.avg_daily_income}
                onChange={handleChange}
                required
              />
            </>
          )}

          {error && <div className="error-text">{error}</div>}

          <button className="primary-button" type="submit" disabled={loading}>
            {loading
              ? "Please wait..."
              : mode === "register"
              ? "Get covered"
              : "Login"}
          </button>

          {mode === "login" && (
            <p className="hint">
              Try seeded accounts: <br />
              <code>raj@gigshield.demo</code> / <code>password123</code> for
              worker, <code>admin@gigshield.demo</code> /{" "}
              <code>password123</code> for admin.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

export default Register;

