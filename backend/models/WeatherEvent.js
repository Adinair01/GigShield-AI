import mongoose from "mongoose";

const weatherEventSchema = new mongoose.Schema(
  {
    city: { type: String, required: true },
    zone: { type: String, required: true },
    rainfall: { type: Number, default: 0 },
    temperature: { type: Number, default: 0 },
    aqi: { type: Number, default: 0 },
    curfew: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const WeatherEvent = mongoose.model("WeatherEvent", weatherEventSchema);

export default WeatherEvent;

