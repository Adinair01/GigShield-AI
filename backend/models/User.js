import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    platform: {
      type: String,
      enum: ["Swiggy", "Zomato", "Amazon"],
      required: true,
    },
    city: { type: String, required: true },
    zone: { type: String, required: true },
    avg_daily_income: { type: Number, required: true },
    risk_score: { type: Number, default: 0 },
    role: {
      type: String,
      enum: ["worker", "admin"],
      default: "worker",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;

