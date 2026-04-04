import React, { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function WorkerDashboard() {
  const { user } = useAuth();
  const [policies, setPolicies] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [polRes, clmRes] = await Promise.all([
        api.get("/policies/mine"),
        api.get("/claims/mine"),
      ]);
      setPolicies(polRes.data);
      setClaims(clmRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const activePolicy = policies.find((p) => p.status === "active");
  const riskScore = user?.risk_score || 0;
  const riskTier =
    riskScore < 40 ? "low" : riskScore < 70 ? "medium" : "high";
  const riskLabel =
    riskScore < 40 ? "Low Risk" : riskScore < 70 ? "Moderate Risk" : "High Risk";

  const daysRemaining = activePolicy
    ? Math.max(0, Math.ceil((new Date(activePolicy.end_date) - new Date()) / (1000 * 60 * 60 * 24)))
    : 0;

  const coveragePercent = activePolicy
    ? Math.min(100, Math.round(((7 - daysRemaining) / 7) * 100))
    : 0;

  const totalPaidOut = claims
    .filter((c) => c.status === "paid")
    .reduce((s, c) => s + c.payout_amount, 0);

  if (loading) {
    return (
      <div className="loading-wrapper">
        <div className="spinner" />
        <span>Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Hero */}
      <div className="hero-card" style={{ marginBottom: 24 }}>
        <div className="hero-left">
          <h2>Welcome back, {user?.name?.split(" ")[0]} 👋</h2>
          <p>
            {activePolicy
              ? `Your ${activePolicy.plan_type} plan is active. You're covered for income loss.`
              : "You don't have an active plan. Get insured to start receiving automatic payouts."}
          </p>
          <div className="hero-stats">
            <div className="hero-stat-block">
              <span>Platform</span>
              <strong>{user?.platform}</strong>
            </div>
            <div className="hero-stat-block">
              <span>City</span>
              <strong>{user?.city}</strong>
            </div>
            <div className="hero-stat-block">
              <span>Total Payouts</span>
              <strong>₹{totalPaidOut}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon blue">🛡️</div>
          <div className="stat-value">
            {activePolicy ? activePolicy.plan_type : "None"}
          </div>
          <div className="stat-label">Active Plan</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon green">📅</div>
          <div className="stat-value">{daysRemaining}</div>
          <div className="stat-label">Days Remaining</div>
        </div>
        <div className="stat-card yellow">
          <div className="stat-icon yellow">⚡</div>
          <div className="stat-value">{claims.length}</div>
          <div className="stat-label">Total Claims</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-icon purple">💰</div>
          <div className="stat-value">₹{totalPaidOut}</div>
          <div className="stat-label">Total Payouts</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-main">
          {/* Active Coverage */}
          {activePolicy && (
            <div className="card">
              <div className="card-header">
                <div className="card-title">🛡️ Active Coverage</div>
                <span className="badge badge-active">Active</span>
              </div>
              <div className="policy-info">
                <div className="policy-row">
                  <span className="policy-row-label">Plan Type</span>
                  <span className="policy-row-value">{activePolicy.plan_type}</span>
                </div>
                <div className="policy-row">
                  <span className="policy-row-label">Weekly Premium</span>
                  <span className="policy-row-value">₹{activePolicy.weekly_premium}/week</span>
                </div>
                <div className="policy-row">
                  <span className="policy-row-label">Coverage Amount</span>
                  <span className="policy-row-value">₹{activePolicy.coverage_amount}</span>
                </div>
                <div className="policy-row">
                  <span className="policy-row-label">Coverage Period</span>
                  <span className="policy-row-value">
                    {new Date(activePolicy.start_date).toLocaleDateString()} → {new Date(activePolicy.end_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="coverage-bar-wrap">
                <div className="coverage-bar-label">
                  <span>Coverage Used</span>
                  <span>{coveragePercent}%</span>
                </div>
                <div className="coverage-bar">
                  <div
                    className="coverage-bar-fill"
                    style={{ width: `${coveragePercent}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Claims History */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">⚡ Claims History</div>
              <div className="card-subtitle">{claims.length} total claims</div>
            </div>
            {claims.length === 0 ? (
              <div className="empty-state">
                No claims yet. Claims are triggered automatically when environmental events occur in your area.
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="claims-table">
                  <thead>
                    <tr>
                      <th>Trigger</th>
                      <th>Amount</th>
                      <th>Risk</th>
                      <th>Fraud</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {claims.map((c) => (
                      <tr key={c._id}>
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
        </div>

        {/* Sidebar */}
        <div className="dashboard-aside">
          {/* Risk Gauge */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">🧠 AI Risk Score</div>
            </div>
            <div className="risk-gauge">
              <div className="gauge-circle" style={{ "--score": riskScore }}>
                <div className="gauge-value">{riskScore}</div>
                <div className="gauge-label">/ 100</div>
              </div>
              <div className={`risk-tier ${riskTier}`}>{riskLabel}</div>
              <div className="risk-note">
                Based on your city, platform, and local
                environmental conditions. Updates dynamically.
              </div>
            </div>
          </div>

          {/* Quick Info */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">ℹ️ How It Works</div>
            </div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7 }}>
              <p style={{ marginBottom: 8 }}>
                <strong>Zero-touch claims.</strong> No paperwork, no waiting.
              </p>
              <p style={{ marginBottom: 8 }}>
                When heavy rain, poor AQI, or a zone shutdown disrupts
                your deliveries, our AI detects it and pays you automatically.
              </p>
              <p>
                Coverage is <strong>income loss only</strong> — keeping premiums
                affordable for every gig worker.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
