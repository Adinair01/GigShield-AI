import WeatherEvent from "../models/WeatherEvent.js";
import User from "../models/User.js";
import Policy from "../models/Policy.js";
import Claim from "../models/Claim.js";
import { fetchWeatherForCity } from "./weatherService.js";
import { evaluateFraudRisk } from "./fraudDetectionService.js";
import { simulatePayout } from "./payoutService.js";
import { logger } from "../utils/logger.js";

const RAIN_THRESHOLD = 80;
const TEMP_THRESHOLD = 44;
const AQI_THRESHOLD = 350;

const estimateIncomeLoss = (user) => {
  // Simple: one day of income lost
  return user.avg_daily_income || 400;
};

export const checkAndTriggerForCity = async (city, { curfew = false } = {}) => {
  const { rainfall, temperature, aqi } = await fetchWeatherForCity(city);

  const triggerTypes = [];
  if (rainfall > RAIN_THRESHOLD) triggerTypes.push({ type: "rainfall", value: rainfall });
  if (temperature > TEMP_THRESHOLD) triggerTypes.push({ type: "temperature", value: temperature });
  if (aqi > AQI_THRESHOLD) triggerTypes.push({ type: "aqi", value: aqi });
  if (curfew) triggerTypes.push({ type: "curfew", value: 1 });

  const weatherEvent = await WeatherEvent.create({
    city,
    zone: "ZONE-1",
    rainfall,
    temperature,
    aqi,
    curfew,
  });

  if (!triggerTypes.length) {
    logger.info("No parametric triggers fired for city", city);
    return { triggered: false, triggers: [], weatherEvent };
  }

  const users = await User.find({ city });
  const results = [];

  for (const user of users) {
    const activePolicy = await Policy.findOne({
      user_id: user._id,
      status: "active",
    });
    if (!activePolicy) continue;

    const loss = estimateIncomeLoss(user);
    const payoutAmount = Math.min(activePolicy.coverage_amount, loss);

    for (const trig of triggerTypes) {
      const claim = await Claim.create({
        user_id: user._id,
        policy_id: activePolicy._id,
        trigger_type: trig.type,
        trigger_value: trig.value,
        payout_amount: payoutAmount,
        status: "approved",
      });

      const fraudScore = await evaluateFraudRisk({
        user,
        claim,
        weatherEvent,
      });

      if (fraudScore > 0.7) {
        claim.status = "rejected";
        await claim.save();
        results.push({ user: user.email, claimId: claim._id, status: "rejected_fraud", fraudScore });
        continue;
      }

      const payout = await simulatePayout({ user, claim });
      claim.status = "paid";
      await claim.save();

      results.push({
        user: user.email,
        claimId: claim._id,
        status: "paid",
        payout,
        fraudScore,
      });
    }
  }

  return {
    triggered: true,
    triggers: triggerTypes,
    weatherEvent,
    results,
  };
};

export const simulateRainstorm = async (city = "Mumbai") => {
  // Simulate high rainfall event for demo
  const weatherEvent = await WeatherEvent.create({
    city,
    zone: "ZONE-1",
    rainfall: 120,
    temperature: 30,
    aqi: 150,
    curfew: false,
  });

  const users = await User.find({ city });
  const results = [];

  for (const user of users) {
    const activePolicy = await Policy.findOne({
      user_id: user._id,
      status: "active",
    });
    if (!activePolicy) continue;

    const loss = estimateIncomeLoss(user);
    const payoutAmount = Math.min(activePolicy.coverage_amount, loss);

    const claim = await Claim.create({
      user_id: user._id,
      policy_id: activePolicy._id,
      trigger_type: "rainfall",
      trigger_value: 120,
      payout_amount: payoutAmount,
      status: "approved",
    });

    const fraudScore = await evaluateFraudRisk({
      user,
      claim,
      weatherEvent,
    });

    if (fraudScore > 0.7) {
      claim.status = "rejected";
      await claim.save();
      results.push({ user: user.email, claimId: claim._id, status: "rejected_fraud", fraudScore });
      continue;
    }

    const payout = await simulatePayout({ user, claim });
    claim.status = "paid";
    await claim.save();

    results.push({
      user: user.email,
      claimId: claim._id,
      status: "paid",
      payout,
      fraudScore,
    });
  }

  return {
    simulated: true,
    trigger: { type: "rainfall", value: 120 },
    weatherEvent,
    results,
  };
};

