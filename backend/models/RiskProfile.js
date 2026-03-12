import mongoose from "mongoose";

const riskProfileSchema = new mongoose.Schema(
  {
    zone: { type: String, required: true, unique: true },
    historical_rainfall: { type: Number, required: true },
    pollution_index: { type: Number, required: true },
    flood_risk: { type: Number, required: true },
    risk_score: { type: Number, required: true },
  },
  { timestamps: true }
);

const RiskProfile = mongoose.model("RiskProfile", riskProfileSchema);

export default RiskProfile;

