import axios from "axios";
import { logger } from "../utils/logger.js";

const FRAUD_SERVICE_URL =
  process.env.ML_FRAUD_SERVICE_URL || "http://ml-service:8000/fraud-score";

export const evaluateFraudRisk = async ({ user, claim, weatherEvent }) => {
  try {
    const payload = {
      user_id: String(user._id),
      claim_id: String(claim._id),
      city: user.city,
      zone: user.zone,
      trigger_type: claim.trigger_type,
      trigger_value: claim.trigger_value || 0,
      rainfall: weatherEvent?.rainfall || 0,
      temperature: weatherEvent?.temperature || 0,
      aqi: weatherEvent?.aqi || 0,
    };

    const { data } = await axios.post(FRAUD_SERVICE_URL, payload);
    return data.fraud_score;
  } catch (err) {
    logger.error("Fraud engine error", err.message);
    return 0.1; // default low fraud risk
  }
};

