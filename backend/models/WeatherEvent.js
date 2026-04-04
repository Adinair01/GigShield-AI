import mongoose from "mongoose";

const weatherEventSchema = new mongoose.Schema(
  {
    city: { type: String, required: true },
    zone: { type: String },
    trigger_type: {
      type: String,
      enum: ["rainfall", "aqi", "shutdown"],
      required: true,
    },
    trigger_value: { type: Number, required: true },
    threshold: { type: Number },
    affected_users: { type: Number, default: 0 },
    claims_generated: { type: Number, default: 0 },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const WeatherEvent = mongoose.model("WeatherEvent", weatherEventSchema);

export default WeatherEvent;
