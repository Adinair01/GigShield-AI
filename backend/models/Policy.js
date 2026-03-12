import mongoose from "mongoose";

const policySchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    plan_type: {
      type: String,
      enum: ["Basic", "Standard", "Premium"],
      required: true,
    },
    weekly_premium: { type: Number, required: true },
    coverage_amount: { type: Number, required: true },
    coverage_hours: { type: Number, default: 40 },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled"],
      default: "active",
    },
  },
  { timestamps: true }
);

const Policy = mongoose.model("Policy", policySchema);

export default Policy;

