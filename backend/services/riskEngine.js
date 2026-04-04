import axios from "axios";
import RiskProfile from "../models/RiskProfile.js";

const ML_SERVICE_URL =
  process.env.ML_SERVICE_URL || "http://localhost:8000";

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

    const { data } = await axios.post(`${ML_SERVICE_URL}/risk-score`, payload);
    return data.risk_score;
  } catch (err) {
    console.error("Risk engine ML error, using fallback:", err.message);
    // Deterministic fallback based on city risk tier
    const cityRisk = {
      Mumbai: 78,
      Delhi: 72,
      Bangalore: 58,
      Chennai: 68,
      Hyderabad: 55,
      Kolkata: 65,
      Pune: 52,
    };
    return cityRisk[user.city] || 50;
  }
};

export const getFraudScore = async (claimData) => {
  try {
    const { data } = await axios.post(`${ML_SERVICE_URL}/fraud-score`, claimData);
    return data.fraud_score;
  } catch (err) {
    console.error("Fraud ML error, using fallback:", err.message);
    // Rule-based fallback
    return 0.1;
  }
};
