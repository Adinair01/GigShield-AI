import mongoose from "mongoose";

const claimSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    policy_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Policy",
      required: true,
    },
    trigger_type: {
      type: String,
      enum: ["rainfall", "aqi", "shutdown"],
      required: true,
    },
    trigger_value: { type: Number, default: 0 },
    payout_amount: { type: Number, required: true },
    risk_score: { type: Number, default: 0 },
    fraud_score: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["approved", "escrow", "rejected", "paid"],
      default: "approved",
    },
    decision_reason: { type: String, default: "" },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Claim = mongoose.model("Claim", claimSchema);

export default Claim;
