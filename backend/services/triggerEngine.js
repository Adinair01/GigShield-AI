import User from "../models/User.js";
import Policy from "../models/Policy.js";
import Claim from "../models/Claim.js";
import WeatherEvent from "../models/WeatherEvent.js";
import { calculateRiskScoreForUser, getFraudScore } from "./riskEngine.js";
import { fetchWeatherForCity } from "./weatherService.js";
import { logger } from "../utils/logger.js";

// Plan payout amounts
const PLAN_PAYOUTS = {
  Basic: 200,
  Standard: 400,
  Premium: 700,
};

// Thresholds
const THRESHOLDS = {
  rainfall: 100, // mm
  aqi: 300,
  shutdown: 1, // boolean-like (1 = zone is shut)
};

// Fraud decision boundaries
const FRAUD_LOW = 0.3;
const FRAUD_MED = 0.65;

// Minimum hours between claims for same user + trigger type (duplicate prevention)
const CLAIM_COOLDOWN_HOURS = 24;

/**
 * Core parametric trigger processor.
 * Called by simulation endpoints with { trigger_type, city, value }.
 * Finds eligible active-policy users in that city, calls ML, decides payout.
 */
export const processParametricTrigger = async ({
  trigger_type,
  city,
  value,
}) => {
  const threshold = THRESHOLDS[trigger_type];
  if (value < threshold) {
    return {
      triggered: false,
      reason: `${trigger_type} value ${value} below threshold ${threshold}`,
      claims: [],
    };
  }

  logger.info(
    `⚡ TRIGGER: ${trigger_type} = ${value} (threshold ${threshold}) in ${city}`
  );

  // Find active-policy users in city
  const users = await User.find({ city, role: "worker" });

  const results = [];
  let claimsGenerated = 0;

  for (const user of users) {
    const activePolicy = await Policy.findOne({
      user_id: user._id,
      status: "active",
      end_date: { $gte: new Date() },
    });

    if (!activePolicy) continue;

    // Duplicate claim prevention — check if same user + trigger type within cooldown
    const cooldownDate = new Date(
      Date.now() - CLAIM_COOLDOWN_HOURS * 60 * 60 * 1000
    );
    const recentClaim = await Claim.findOne({
      user_id: user._id,
      trigger_type,
      timestamp: { $gte: cooldownDate },
    });

    if (recentClaim) {
      results.push({
        user: user.name,
        status: "skipped",
        reason: "Duplicate — claim already filed within 24h",
      });
      continue;
    }

    // Get weather context for fraud scoring
    const weather = await fetchWeatherForCity(city);

    // Risk score from ML
    const riskScore = await calculateRiskScoreForUser(user);

    // Fraud score from ML
    const fraudData = {
      user_id: String(user._id),
      claim_id: "pending",
      city: user.city,
      zone: user.zone,
      trigger_type,
      trigger_value: value,
      rainfall: weather.rainfall,
      temperature: weather.temperature,
      aqi: weather.aqi,
    };
    const fraudScore = await getFraudScore(fraudData);

    // Decision engine
    let status, decisionReason;
    if (fraudScore < FRAUD_LOW) {
      status = "approved";
      decisionReason = `Low fraud risk (${fraudScore.toFixed(
        3
      )}). Auto-approved.`;
    } else if (fraudScore < FRAUD_MED) {
      status = "escrow";
      decisionReason = `Medium fraud risk (${fraudScore.toFixed(
        3
      )}). Held in escrow for review.`;
    } else {
      status = "rejected";
      decisionReason = `High fraud risk (${fraudScore.toFixed(
        3
      )}). Claim rejected.`;
    }

    const payoutAmount = PLAN_PAYOUTS[activePolicy.plan_type] || 200;

    const claim = await Claim.create({
      user_id: user._id,
      policy_id: activePolicy._id,
      trigger_type,
      trigger_value: value,
      payout_amount: payoutAmount,
      risk_score: riskScore,
      fraud_score: fraudScore,
      status,
      decision_reason: decisionReason,
    });

    // If approved, mark as paid (simulated instant payout)
    if (status === "approved") {
      claim.status = "paid";
      await claim.save();
    }

    claimsGenerated++;

    results.push({
      user: user.name,
      userId: user._id,
      claimId: claim._id,
      status: claim.status,
      payoutAmount,
      riskScore,
      fraudScore,
      decisionReason,
    });
  }

  // Log event
  await WeatherEvent.create({
    city,
    trigger_type,
    trigger_value: value,
    threshold,
    affected_users: users.length,
    claims_generated: claimsGenerated,
  });

  return {
    triggered: true,
    trigger_type,
    city,
    value,
    threshold,
    totalEligible: users.length,
    claimsGenerated,
    claims: results,
  };
};
