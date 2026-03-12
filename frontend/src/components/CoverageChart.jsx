import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

function CoverageChart({ claimsPerCity }) {
  const data =
    claimsPerCity && claimsPerCity.length
      ? claimsPerCity.map((c) => ({
          city: c.city,
          claims: c.count,
        }))
      : [
          { city: "Mumbai", claims: 3 },
          { city: "Bangalore", claims: 1 },
          { city: "Delhi", claims: 2 },
        ];

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">Claims by City</div>
        <div className="card-subtitle">
          Visualising weather-linked income loss across metros.
        </div>
      </div>
      <div className="card-body chart-body">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorClaims" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="city" />
            <YAxis />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="claims"
              stroke="#4f46e5"
              fillOpacity={1}
              fill="url(#colorClaims)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default CoverageChart;

