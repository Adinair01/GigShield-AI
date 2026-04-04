import React, { useEffect, useState } from "react";
import api from "../api";

export default function PlanSelection({ onPlanSelected }) {
  const [plans, setPlans] = useState([]);
  const [riskScore, setRiskScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const { data } = await api.get("/policies/plans");
      setPlans(data.plans);
      setRiskScore(data.risk_score);
    } catch (err) {
      setError("Failed to load plans");
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async (planName) => {
    setPurchasing(planName);
    setError("");
    try {
      await api.post("/policies", { plan_type: planName });
      setSuccess(`${planName} plan activated! You're now covered for 7 days.`);
      if (onPlanSelected) onPlanSelected();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to purchase plan");
    } finally {
      setPurchasing(null);
    }
  };

  const PLAN_FEATURES = {
    Basic: [
      "Income loss coverage up to ₹200",
      "Rainfall trigger",
      "Weekly auto-renewal",
      "Basic fraud protection",
    ],
    Standard: [
      "Income loss coverage up to ₹400",
      "Rainfall + AQI triggers",
      "Weekly auto-renewal",
      "Enhanced fraud protection",
      "Priority payouts",
    ],
    Premium: [
      "Income loss coverage up to ₹700",
      "All 3 triggers (Rain, AQI, Shutdown)",
      "Weekly auto-renewal",
      "Advanced ML fraud protection",
      "Instant payouts",
      "Dedicated support",
    ],
  };

  if (loading) {
    return (
      <div className="loading-wrapper">
        <div className="spinner" />
        <span>Loading plans...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>Choose Your Shield ⚡</h1>
        <p>
          Weekly parametric insurance — AI-priced based on your risk score of{" "}
          <strong style={{ color: "var(--accent-light)" }}>{riskScore}</strong>
        </p>
      </div>

      {success && (
        <div className="success-banner">✅ {success}</div>
      )}
      {error && <p className="error-text">{error}</p>}

      <div className="plans-grid">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`plan-card ${plan.name.toLowerCase()} ${
              plan.name === "Standard" ? "recommended" : ""
            }`}
          >
            {plan.name === "Standard" && (
              <div className="plan-badge">Recommended</div>
            )}
            <div className="plan-name">{plan.name}</div>
            <div className="plan-price">
              <span className="plan-amount">₹{plan.adjusted_premium}</span>
              <span className="plan-period">/week</span>
            </div>
            {plan.adjusted_premium !== plan.base_premium && (
              <div className="plan-base-price">
                Base: ₹{plan.base_premium}/week
              </div>
            )}
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 16 }}>
              Risk-adjusted × {plan.risk_multiplier}
            </div>
            <ul className="plan-features">
              {PLAN_FEATURES[plan.name]?.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
            <button
              className="btn btn-primary"
              style={{ width: "100%" }}
              disabled={purchasing === plan.name || !!success}
              onClick={() => handleBuy(plan.name)}
            >
              {purchasing === plan.name ? "Processing..." : `Get ${plan.name}`}
            </button>
            <div style={{ marginTop: 8, fontSize: 11, color: "var(--text-muted)", textAlign: "center" }}>
              Coverage: ₹{plan.coverage_amount} per claim
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
