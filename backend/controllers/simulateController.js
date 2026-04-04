import { processParametricTrigger } from "../services/triggerEngine.js";
import WeatherEvent from "../models/WeatherEvent.js";

export const simulateRain = async (req, res, next) => {
  try {
    const { city, value } = req.body;
    if (!city || value === undefined) {
      return res
        .status(400)
        .json({ message: "city and value are required" });
    }

    const result = await processParametricTrigger({
      trigger_type: "rainfall",
      city,
      value: Number(value),
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const simulateAqi = async (req, res, next) => {
  try {
    const { city, value } = req.body;
    if (!city || value === undefined) {
      return res
        .status(400)
        .json({ message: "city and value are required" });
    }

    const result = await processParametricTrigger({
      trigger_type: "aqi",
      city,
      value: Number(value),
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const simulateShutdown = async (req, res, next) => {
  try {
    const { city, value } = req.body;
    if (!city) {
      return res.status(400).json({ message: "city is required" });
    }

    const result = await processParametricTrigger({
      trigger_type: "shutdown",
      city,
      value: value !== undefined ? Number(value) : 1,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getEvents = async (req, res, next) => {
  try {
    const events = await WeatherEvent.find()
      .sort({ timestamp: -1 })
      .limit(50);
    res.json(events);
  } catch (err) {
    next(err);
  }
};
