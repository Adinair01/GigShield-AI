import Policy from "../models/Policy.js";
import User from "../models/User.js";

const basePlans = {
  Basic: { weekly_premium: 20, coverage_amount: 200 },
  Standard: { weekly_premium: 40, coverage_amount: 400 },
  Premium: { weekly_premium: 60, coverage_amount: 700 },
};

const adjustPremiumForRisk = (basePremium, riskScore) => {
  const factor = 0.7 + (riskScore / 100) * 0.8; // 0.7x to 1.5x
  return Math.round(basePremium * factor);
};

export const listPolicies = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const policies = await Policy.find({ user_id: userId }).sort("-createdAt");
    res.json(policies);
  } catch (err) {
    next(err);
  }
};

export const createPolicy = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { plan_type } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const planConfig = basePlans[plan_type];
    if (!planConfig) {
      return res.status(400).json({ message: "Invalid plan type" });
    }

    const weekly_premium = adjustPremiumForRisk(
      planConfig.weekly_premium,
      user.risk_score || 50
    );

    const policy = await Policy.create({
      user_id: user._id,
      plan_type,
      weekly_premium,
      coverage_amount: planConfig.coverage_amount,
      coverage_hours: 40,
      status: "active",
    });

    res.status(201).json(policy);
  } catch (err) {
    next(err);
  }
};

export const recommendedPlans = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const plans = Object.entries(basePlans).map(([plan_type, config]) => ({
      plan_type,
      base_weekly_premium: config.weekly_premium,
      adjusted_weekly_premium: adjustPremiumForRisk(
        config.weekly_premium,
        user.risk_score || 50
      ),
      coverage_amount: config.coverage_amount,
    }));

    res.json({ risk_score: user.risk_score, plans });
  } catch (err) {
    next(err);
  }
};

