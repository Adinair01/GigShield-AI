import React, { useEffect, useState, useCallback } from "react";
import api from "../api";

const CITIES = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad"];

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [allClaims, setAllClaims] = useState([]);
  const [fraudAlerts, setFraudAlerts] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");

  // Trigger state
  const [triggerCity, setTriggerCity] = useState("Mumbai");
  const [rainValue, setRainValue] = useState(150);
  const [aqiValue, setAqiValue] = useState(350);
  const [simulating, setSimulating] = useState(null);
  const [simResult, setSimResult] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [analyticsRes, claimsRes, fraudRes, eventsRes] = await Promise.all([
        api.get("/risk/analytics"),
        api.get("/claims/all"),
        api.get("/claims/fraud"),
        api.get("/simulate/events"),
      ]);
      setAnalytics(analyticsRes.data);
      setAllClaims(claimsRes.data);
      setFraudAlerts(fraudRes.data);
      setEvents(eventsRes.data);
    } catch (err) {
      console.error("Admin data load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const fireTrigger = async (type, value) => {
    setSimulating(type);
    setSimResult(null);
    try {
      const { data } = await api.post(`/simulate/${type}`, {
        city: triggerCity,
        value,
      });
      setSimResult(data);
      // Reload data after trigger
      await loadData();
    } catch (err) {
      setSimResult({
        error: err.response?.data?.message || "Trigger failed",
      });
    } finally {
      setSimulating(null);
    }
  };

  if (loading) {
    return (
      <div className="loading-wrapper">
        <div className="spinner" />
        <span>Loading admin dashboard...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>Admin Command Center 🎯</h1>
        <p>Monitor, simulate triggers, and manage the Earn Shield AI platform</p>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {["overview", "triggers", "claims", "fraud"].map((t) => (
          <button
            key={t}
            className={`tab ${tab === t ? "active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* --------- OVERVIEW TAB --------- */}
      {tab === "overview" && (
        <>
          <div className="stats-grid">
            <div className="stat-card blue">
              <div className="stat-icon blue">👥</div>
              <div className="stat-value">{analytics?.totalWorkers || 0}</div>
              <div className="stat-label">Total Workers</div>
            </div>
            <div className="stat-card green">
              <div className="stat-icon green">🛡️</div>
              <div className="stat-value">{analytics?.activePolicies || 0}</div>
              <div className="stat-label">Active Policies</div>
            </div>
            <div className="stat-card yellow">
              <div className="stat-icon yellow">⚡</div>
              <div className="stat-value">{analytics?.claimsToday || 0}</div>
              <div className="stat-label">Claims Today</div>
            </div>
            <div className="stat-card purple">
              <div className="stat-icon purple">💰</div>
              <div className="stat-value">₹{analytics?.totalPayout || 0}</div>
              <div className="stat-label">Total Payouts</div>
            </div>
          </div>

          <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            <div className="stat-card blue">
              <div className="stat-icon blue">📊</div>
              <div className="stat-value">{analytics?.totalClaims || 0}</div>
              <div className="stat-label">Total Claims</div>
            </div>
            <div className="stat-card green">
              <div className="stat-icon green">💵</div>
              <div className="stat-value">₹{analytics?.totalPremiums || 0}</div>
              <div className="stat-label">Weekly Premiums</div>
            </div>
            <div className="stat-card red">
              <div className="stat-icon red">🚨</div>
              <div className="stat-value">{analytics?.fraudAlerts || 0}</div>
              <div className="stat-label">Fraud Alerts</div>
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="dashboard-main">
              {/* Claims by City */}
              <div className="card">
                <div className="card-header">
                  <div className="card-title">📍 Claims by City</div>
                </div>
                {analytics?.claimsPerCity?.length > 0 ? (
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                    {analytics.claimsPerCity.map((c) => (
                      <div
                        key={c.city}
                        style={{
                          padding: "12px 20px",
                          borderRadius: "var(--radius-md)",
                          background: "var(--bg-primary)",
                          border: "1px solid var(--border)",
                          textAlign: "center",
                          minWidth: 100,
                        }}
                      >
                        <div style={{ fontSize: 24, fontWeight: 700 }}>{c.count}</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{c.city}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">No claims data yet</div>
                )}
              </div>

              {/* Claims by Trigger */}
              <div className="card">
                <div className="card-header">
                  <div className="card-title">⚡ Claims by Trigger Type</div>
                </div>
                {analytics?.claimsByTrigger?.length > 0 ? (
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                    {analytics.claimsByTrigger.map((t) => (
                      <div
                        key={t._id}
                        style={{
                          padding: "12px 20px",
                          borderRadius: "var(--radius-md)",
                          background: "var(--bg-primary)",
                          border: "1px solid var(--border)",
                          textAlign: "center",
                          minWidth: 120,
                        }}
                      >
                        <div style={{ fontSize: 20, fontWeight: 700 }}>{t.count}</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "capitalize" }}>
                          {t._id}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--accent-light)", marginTop: 4 }}>
                          ₹{t.totalPayout} paid
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">No trigger data yet. Fire a simulation!</div>
                )}
              </div>
            </div>

            {/* Recent Events */}
            <div className="dashboard-aside">
              <div className="card">
                <div className="card-header">
                  <div className="card-title">📋 Recent Events</div>
                </div>
                {events.length === 0 ? (
                  <div className="empty-state">No events yet</div>
                ) : (
                  <ul className="event-list">
                    {events.slice(0, 10).map((ev) => (
                      <li key={ev._id} className="event-item">
                        <div className={`event-dot ${ev.trigger_type}`} />
                        <div style={{ flex: 1 }}>
                          <div>
                            <strong style={{ textTransform: "capitalize" }}>
                              {ev.trigger_type}
                            </strong>{" "}
                            in {ev.city}
                            <span style={{ color: "var(--text-muted)" }}>
                              {" "}— value: {ev.trigger_value}
                            </span>
                          </div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                            {ev.claims_generated} claims generated
                          </div>
                          <div className="event-time">
                            {new Date(ev.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* --------- TRIGGERS TAB --------- */}
      {tab === "triggers" && (
        <>
          <div style={{ marginBottom: 24 }}>
            <div className="form-group" style={{ maxWidth: 300 }}>
              <label>Target City</label>
              <select
                className="form-select"
                value={triggerCity}
                onChange={(e) => setTriggerCity(e.target.value)}
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="trigger-section">
            {/* Rain Trigger */}
            <div className="trigger-card">
              <div className="trigger-header">
                <div className="trigger-icon" style={{ background: "var(--accent-glow)", color: "var(--accent)" }}>
                  🌧️
                </div>
                <div>
                  <div className="trigger-title">Heavy Rain</div>
                  <div className="trigger-desc">Threshold: 100mm</div>
                </div>
              </div>
              <div className="trigger-controls">
                <div className="trigger-input-row">
                  <input
                    className="form-input"
                    type="number"
                    value={rainValue}
                    onChange={(e) => setRainValue(Number(e.target.value))}
                    placeholder="Rainfall (mm)"
                  />
                  <button
                    className="btn btn-primary btn-sm"
                    disabled={simulating === "rain"}
                    onClick={() => fireTrigger("rain", rainValue)}
                  >
                    {simulating === "rain" ? "..." : "Fire"}
                  </button>
                </div>
              </div>
            </div>

            {/* AQI Trigger */}
            <div className="trigger-card">
              <div className="trigger-header">
                <div className="trigger-icon" style={{ background: "var(--yellow-glow)", color: "var(--yellow)" }}>
                  🏭
                </div>
                <div>
                  <div className="trigger-title">Severe AQI</div>
                  <div className="trigger-desc">Threshold: 300 AQI</div>
                </div>
              </div>
              <div className="trigger-controls">
                <div className="trigger-input-row">
                  <input
                    className="form-input"
                    type="number"
                    value={aqiValue}
                    onChange={(e) => setAqiValue(Number(e.target.value))}
                    placeholder="AQI Value"
                  />
                  <button
                    className="btn btn-primary btn-sm"
                    disabled={simulating === "aqi"}
                    onClick={() => fireTrigger("aqi", aqiValue)}
                  >
                    {simulating === "aqi" ? "..." : "Fire"}
                  </button>
                </div>
              </div>
            </div>

            {/* Shutdown Trigger */}
            <div className="trigger-card">
              <div className="trigger-header">
                <div className="trigger-icon" style={{ background: "var(--red-glow)", color: "var(--red)" }}>
                  🚫
                </div>
                <div>
                  <div className="trigger-title">Zone Shutdown</div>
                  <div className="trigger-desc">Zone lockdown / low movement</div>
                </div>
              </div>
              <div className="trigger-controls">
                <button
                  className="btn btn-danger btn-sm"
                  style={{ width: "100%" }}
                  disabled={simulating === "shutdown"}
                  onClick={() => fireTrigger("shutdown", 1)}
                >
                  {simulating === "shutdown" ? "Processing..." : "Trigger Shutdown"}
                </button>
              </div>
            </div>
          </div>

          {/* Simulation Results */}
          {simResult && (
            <div className="sim-results">
              {simResult.error ? (
                <p className="error-text">{simResult.error}</p>
              ) : (
                <>
                  <h4>
                    {simResult.triggered ? "✅ Trigger Fired" : "⚠️ Below Threshold"} —{" "}
                    {simResult.trigger_type} in {simResult.city}
                  </h4>
                  {simResult.triggered && (
                    <>
                      <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 10 }}>
                        Value: {simResult.value} | Threshold: {simResult.threshold} |
                        Eligible: {simResult.totalEligible} | Claims: {simResult.claimsGenerated}
                      </p>
                      {simResult.claims?.map((c, i) => (
                        <div key={i} className="sim-claim">
                          <span className="sim-claim-user">{c.user}</span>
                          <span>
                            {c.status === "skipped" ? (
                              <span style={{ color: "var(--text-muted)" }}>{c.reason}</span>
                            ) : (
                              <>
                                ₹{c.payoutAmount} —{" "}
                                <span className={`badge badge-${c.status}`}>{c.status}</span>
                                <span style={{ marginLeft: 8, fontSize: 11, color: "var(--text-muted)" }}>
                                  fraud: {c.fraudScore?.toFixed(3)}
                                </span>
                              </>
                            )}
                          </span>
                        </div>
                      ))}
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </>
      )}

      {/* --------- CLAIMS TAB --------- */}
      {tab === "claims" && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">📋 All Claims</div>
            <div className="card-subtitle">{allClaims.length} total</div>
          </div>
          {allClaims.length === 0 ? (
            <div className="empty-state">
              No claims yet. Use the Triggers tab to simulate events.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="claims-table">
                <thead>
                  <tr>
                    <th>Worker</th>
                    <th>City</th>
                    <th>Trigger</th>
                    <th>Amount</th>
                    <th>Risk</th>
                    <th>Fraud</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {allClaims.map((c) => (
                    <tr key={c._id}>
                      <td style={{ fontWeight: 500, color: "var(--text-primary)" }}>
                        {c.user_id?.name || "—"}
                      </td>
                      <td>{c.user_id?.city || "—"}</td>
                      <td style={{ textTransform: "capitalize" }}>{c.trigger_type}</td>
                      <td style={{ fontWeight: 600 }}>₹{c.payout_amount}</td>
                      <td>{c.risk_score?.toFixed(1)}</td>
                      <td>{c.fraud_score?.toFixed(3)}</td>
                      <td>
                        <span className={`badge badge-${c.status}`}>
                          {c.status}
                        </span>
                      </td>
                      <td>{new Date(c.timestamp).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* --------- FRAUD TAB --------- */}
      {tab === "fraud" && (
        <div>
          <div className="stats-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)", marginBottom: 24 }}>
            <div className="stat-card red">
              <div className="stat-icon red">🚨</div>
              <div className="stat-value">{fraudAlerts.length}</div>
              <div className="stat-label">Flagged Claims</div>
            </div>
            <div className="stat-card yellow">
              <div className="stat-icon yellow">⏳</div>
              <div className="stat-value">
                {fraudAlerts.filter((f) => f.status === "escrow").length}
              </div>
              <div className="stat-label">In Escrow</div>
            </div>
          </div>

          <div className="card fraud-card">
            <div className="card-header">
              <div className="card-title">🚨 Fraud-Flagged Claims</div>
            </div>
            {fraudAlerts.length === 0 ? (
              <div className="empty-state">
                No fraud alerts. All claims are clean! 🎉
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="claims-table">
                  <thead>
                    <tr>
                      <th>Worker</th>
                      <th>Platform</th>
                      <th>Zone</th>
                      <th>Trigger</th>
                      <th>Fraud Score</th>
                      <th>Status</th>
                      <th>Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fraudAlerts.map((f) => (
                      <tr key={f._id}>
                        <td style={{ fontWeight: 500, color: "var(--text-primary)" }}>
                          {f.user_id?.name || "—"}
                        </td>
                        <td>{f.user_id?.platform || "—"}</td>
                        <td>{f.user_id?.zone || "—"}</td>
                        <td style={{ textTransform: "capitalize" }}>{f.trigger_type}</td>
                        <td style={{ fontWeight: 700, color: f.fraud_score > 0.6 ? "var(--red)" : "var(--yellow)" }}>
                          {f.fraud_score?.toFixed(3)}
                        </td>
                        <td>
                          <span className={`badge badge-${f.status}`}>{f.status}</span>
                        </td>
                        <td style={{ fontSize: 11, color: "var(--text-muted)", maxWidth: 200 }}>
                          {f.decision_reason}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
