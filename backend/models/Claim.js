import mongoose from "mongoose";

const claimSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    policy_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Policy",
      required: true,
    },
    trigger_type: {
      type: String,
      enum: ["rainfall", "temperature", "aqi", "curfew"],
      required: true,
    },
    trigger_value: { type: Number, required: false },
    payout_amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "paid"],
      default: "approved",
    },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Claim = mongoose.model("Claim", claimSchema);

export default Claim;

