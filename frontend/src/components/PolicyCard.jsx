import React from "react";

function PolicyCard({ plan, onSelect }) {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">{plan.plan_type} Plan</div>
        <div className="card-chip">₹{plan.adjusted_weekly_premium}/week</div>
      </div>
      <div className="card-body">
        <div className="stat-row">
          <span>Base premium</span>
          <span>₹{plan.base_weekly_premium}</span>
        </div>
        <div className="stat-row">
          <span>Coverage amount</span>
          <span>₹{plan.coverage_amount}</span>
        </div>
      </div>
      {onSelect && (
        <button className="primary-button" onClick={onSelect}>
          Choose {plan.plan_type}
        </button>
      )}
    </div>
  );
}

export default PolicyCard;

