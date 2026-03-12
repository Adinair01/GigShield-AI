import React from "react";

function RiskScore({ score }) {
  const tier =
    score < 40 ? "Low" : score < 70 ? "Moderate" : score < 85 ? "High" : "Severe";

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">Risk Score</div>
      </div>
      <div className="card-body risk-score">
        <div className="risk-value">{score}</div>
        <div className="risk-tier">{tier} disruption risk</div>
        <div className="risk-caption">
          Based on hyperlocal rainfall, pollution and flood patterns in your zone.
        </div>
      </div>
    </div>
  );
}

export default RiskScore;

