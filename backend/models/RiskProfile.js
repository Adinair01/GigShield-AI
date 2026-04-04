import mongoose from "mongoose";

const riskProfileSchema = new mongoose.Schema(
  {
    zone: { type: String, required: true, unique: true },
    city: { type: String },
    historical_rainfall: { type: Number, default: 50 },
    pollution_index: { type: Number, default: 100 },
    flood_risk: { type: Number, default: 0.3 },
    risk_score: { type: Number, default: 50 },
  },
  { timestamps: true }
);

const RiskProfile = mongoose.model("RiskProfile", riskProfileSchema);

export default RiskProfile;
