import axios from "axios";
import RiskProfile from "../models/RiskProfile.js";

const ML_SERVICE_URL =
  process.env.ML_SERVICE_URL || "http://ml-service:8000/risk-score";

export const calculateRiskScoreForUser = async (user) => {
  try {
    const zoneProfile = await RiskProfile.findOne({ zone: user.zone });

    const payload = {
      city: user.city,
      historical_weather: zoneProfile
        ? zoneProfile.historical_rainfall
        : 50,
      pollution_level: zoneProfile ? zoneProfile.pollution_index : 100,
      flood_risk: zoneProfile ? zoneProfile.flood_risk : 0.3,
    };

    const { data } = await axios.post(ML_SERVICE_URL, payload);
    return data.risk_score;
  } catch (err) {
    console.error("Risk engine error", err.message);
    const fallback =
      (user.avg_daily_income / 1000) * (user.platform === "Amazon" ? 1.2 : 1);
    return Math.max(10, Math.min(90, Math.round(fallback)));
  }
};

