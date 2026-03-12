import React from "react";

function ClaimHistory({ claims }) {
  if (!claims || !claims.length) {
    return <div className="empty-state">No claims yet. You&apos;re all clear.</div>;
  }

return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">Recent Claims</div>
      </div>
      <div className="card-body">
        <div className="table">
          <div className="table-header">
            <span>Trigger</span>
            <span>Payout</span>
            <span>Status</span>
            <span>When</span>
          </div>
          {claims.map((c) => (
            <div key={c._id} className="table-row">
              <span>{c.trigger_type}</span>
              <span>₹{c.payout_amount}</span>
              <span className={`badge badge-${c.status}`}>{c.status}</span>
              <span>{new Date(c.createdAt).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ClaimHistory;

