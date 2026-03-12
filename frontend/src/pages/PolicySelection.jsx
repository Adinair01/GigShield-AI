import React, { useEffect, useState } from "react";
import { getRecommendedPlans, createPolicy } from "../services/api.js";
import PolicyCard from "../components/PolicyCard.jsx";

function PolicySelection({ token, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      const d = await getRecommendedPlans(token);
      setData(d);
      setLoading(false);
    };
    load().catch(console.error);
  }, [token]);

  const handleSelect = async (plan_type) => {
    setMessage("");
    try {
      await createPolicy(token, plan_type);
      setMessage(`You are now covered under the ${plan_type} plan.`);
    } catch (err) {
      setMessage(
        err.response?.data?.message ||
          "Unable to create policy. Please try again."
      );
    }
  };

  if (loading) {
    return <div className="loading">Loading smart recommendations…</div>;
  }

  return (
    <div className="single-column">
      <div className="page-header">
        <button className="ghost-button" onClick={onBack}>
          ← Back
        </button>
        <h2>Smart coverage recommendation</h2>
        <p>
          Based on your historical weather, pollution and flood risk, we&apos;ve
          adjusted the weekly premiums below.
        </p>
      </div>

      <div className="plan-grid">
        {data?.plans?.map((p) => (
          <PolicyCard
            key={p.plan_type}
            plan={p}
            onSelect={() => handleSelect(p.plan_type)}
          />
        ))}
      </div>

      {message && <div className="info-banner">{message}</div>}
    </div>
  );
}

export default PolicySelection;

