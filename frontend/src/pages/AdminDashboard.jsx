import React, { useEffect, useState } from "react";
import {
  getAnalytics,
  simulateRainstormApi,
  triggerCityDisruption,
} from "../services/api.js";
import CoverageChart from "../components/CoverageChart.jsx";

function AdminDashboard({ token }) {
  const [analytics, setAnalytics] = useState(null);
  const [city, setCity] = useState("Mumbai");
  const [curfew, setCurfew] = useState(false);
  const [log, setLog] = useState([]);

  const load = async () => {
    const a = await getAnalytics(token);
    setAnalytics(a);
  };

  useEffect(() => {
    load().catch(console.error);
  }, [token]);

  const addLog = (entry) => {
    setLog((l) => [entry, ...l].slice(0, 5));
  };

  const handleSimulateRain = async () => {
    const res = await simulateRainstormApi(token, { city });
    addLog(
      `Simulated rainstorm in ${city}: triggered ${res.results.length} payouts.`
    );
    await load();
  };

  const handleTriggerParams = async () => {
    const res = await triggerCityDisruption(token, { city, curfew });
    if (!res.triggered) {
      addLog(`No thresholds breached in ${city}. No claims created.`);
    } else {
      addLog(
        `Parametric trigger in ${city}: ${res.triggers
          .map((t) => t.type)
          .join(", ")} for ${res.results.length} workers.`
      );
    }
    await load();
  };

  return (
    <div className="single-column">
      <div className="page-header">
        <h2>Admin control room</h2>
        <p>
          Monitor portfolio health, hyperlocal risk, and run live demos of
          parametric payouts for stakeholders.
        </p>
      </div>

      <div className="grid-two">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Portfolio snapshot</div>
          </div>
          <div className="card-body stats-grid">
            <div className="stat-block">
              <span>Total workers</span>
              <strong>{analytics?.totalWorkers ?? 0}</strong>
            </div>
            <div className="stat-block">
              <span>Active policies</span>
              <strong>{analytics?.activePolicies ?? 0}</strong>
            </div>
            <div className="stat-block">
              <span>Total claims</span>
              <strong>{analytics?.totalClaims ?? 0}</strong>
            </div>
            <div className="stat-block">
              <span>Loss ratio</span>
              <strong>{analytics?.lossRatio ?? 0}</strong>
            </div>
          </div>
        </div>

        <CoverageChart claimsPerCity={analytics?.claimsPerCity ?? []} />
      </div>

      <div className="grid-two">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Trigger disruption demo</div>
          </div>
          <div className="card-body">
            <div className="field-row">
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
              >
                <option value="Mumbai">Mumbai</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Delhi">Delhi</option>
              </select>
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={curfew}
                  onChange={(e) => setCurfew(e.target.checked)}
                />
                Curfew
              </label>
            </div>
            <div className="button-row">
              <button className="primary-button" onClick={handleSimulateRain}>
                Simulate rainstorm
              </button>
              <button className="ghost-button" onClick={handleTriggerParams}>
                Run live parametric check
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Event log</div>
          </div>
          <div className="card-body">
            {log.length === 0 && (
              <div className="empty-state">
                No events yet. Trigger a rainstorm demo to see automatic
                payouts.
              </div>
            )}
            <ul className="event-log">
              {log.map((entry, idx) => (
                <li key={idx}>{entry}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;

