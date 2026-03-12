import React, { useEffect, useState } from "react";
import { getMe, getRiskScore, getClaims } from "../services/api.js";
import RiskScore from "../components/RiskScore.jsx";
import ClaimHistory from "../components/ClaimHistory.jsx";
import CoverageChart from "../components/CoverageChart.jsx";

function Dashboard({ token, onChoosePlan }) {
  const [summary, setSummary] = useState(null);
  const [risk, setRisk] = useState(null);
  const [claims, setClaims] = useState([]);

  useEffect(() => {
    const load = async () => {
      const [me, r, cs] = await Promise.all([
        getMe(token),
        getRiskScore(token),
        getClaims(token),
      ]);
      setSummary(me);
      setRisk(r);
      setClaims(cs);
    };
    load().catch(console.error);
  }, [token]);

  const activePolicy = summary?.activePolicy;

  return (
    <div className="grid-layout">
      <div className="grid-main">
        <div className="card hero">
          <div>
            <div className="hero-label">Worker dashboard</div>
            <h2>
              You&apos;re protected against
              <br />
              rain, pollution and curfews.
            </h2>
            <p>
              When thresholds are breached in your zone, GigShield automatically
              estimates your lost income and pays out to your wallet. No manual
              claims.
            </p>
            {!activePolicy && (
              <button className="primary-button" onClick={onChoosePlan}>
                Choose a weekly cover
              </button>
            )}
          </div>
          {activePolicy && (
            <div className="hero-summary">
              <div className="stat-block">
                <span>Active plan</span>
                <strong>{activePolicy.plan_type}</strong>
              </div>
              <div className="stat-block">
                <span>Weekly premium</span>
                <strong>₹{activePolicy.weekly_premium}</strong>
              </div>
              <div className="stat-block">
                <span>Coverage amount</span>
                <strong>₹{activePolicy.coverage_amount}</strong>
              </div>
            </div>
          )}
        </div>

        <div className="grid-two">
          <RiskScore score={risk?.risk_score ?? 0} />
          <CoverageChart claimsPerCity={[]} />
        </div>

        <ClaimHistory claims={claims} />
      </div>

      <aside className="grid-aside">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Coverage snapshot</div>
          </div>
          <div className="card-body">
            <div className="stat-row">
              <span>City</span>
              <span>{summary?.user?.city}</span>
            </div>
            <div className="stat-row">
              <span>Zone</span>
              <span>{summary?.user?.zone}</span>
            </div>
            <div className="stat-row">
              <span>Avg daily income</span>
              <span>₹{summary?.user?.avg_daily_income}</span>
            </div>
            <div className="stat-row">
              <span>Recent claims</span>
              <span>{claims.length}</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default Dashboard;

