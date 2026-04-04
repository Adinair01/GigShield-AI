import Policy from "../models/Policy.js";
import User from "../models/User.js";

// Plan configs: weekly premium and coverage based on plan type
const PLAN_CONFIG = {
  Basic: { weekly_premium: 20, coverage_amount: 200 },
  Standard: { weekly_premium: 35, coverage_amount: 400 },
  Premium: { weekly_premium: 50, coverage_amount: 700 },
};

export const createPolicy = async (req, res, next) => {
  try {
    const { plan_type } = req.body;
    const userId = req.user._id;

    if (!PLAN_CONFIG[plan_type]) {
      return res.status(400).json({ message: "Invalid plan type" });
    }

    // Check if user already has active policy
    const existing = await Policy.findOne({
      user_id: userId,
      status: "active",
      end_date: { $gte: new Date() },
    });

    if (existing) {
      return res
        .status(400)
        .json({ message: "You already have an active policy" });
    }

    const config = PLAN_CONFIG[plan_type];
    const user = await User.findById(userId);

    // AI-adjusted premium: base * (1 + risk_score/200)
    const riskMultiplier = 1 + (user.risk_score || 50) / 200;
    const adjustedPremium = Math.round(
      config.weekly_premium * riskMultiplier
    );

    const now = new Date();
    const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const policy = await Policy.create({
      user_id: userId,
      plan_type,
      weekly_premium: adjustedPremium,
      coverage_amount: config.coverage_amount,
      start_date: now,
      end_date: endDate,
    });

    res.status(201).json(policy);
  } catch (err) {
    next(err);
  }
};

export const getMyPolicies = async (req, res, next) => {
  try {
    const policies = await Policy.find({ user_id: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(policies);
  } catch (err) {
    next(err);
  }
};

export const getAllPolicies = async (req, res, next) => {
  try {
    const policies = await Policy.find()
      .populate("user_id", "name email city platform")
      .sort({ createdAt: -1 });
    res.json(policies);
  } catch (err) {
    next(err);
  }
};

export const getPlans = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const riskMultiplier = 1 + (user.risk_score || 50) / 200;

    const plans = Object.entries(PLAN_CONFIG).map(([name, config]) => ({
      name,
      base_premium: config.weekly_premium,
      adjusted_premium: Math.round(config.weekly_premium * riskMultiplier),
      coverage_amount: config.coverage_amount,
      risk_multiplier: Number(riskMultiplier.toFixed(2)),
    }));

    res.json({ plans, risk_score: user.risk_score });
  } catch (err) {
    next(err);
  }
};
