import Claim from "../models/Claim.js";

export const getMyClaims = async (req, res, next) => {
  try {
    const claims = await Claim.find({ user_id: req.user._id })
      .populate("policy_id", "plan_type weekly_premium")
      .sort({ timestamp: -1 });
    res.json(claims);
  } catch (err) {
    next(err);
  }
};

export const getAllClaims = async (req, res, next) => {
  try {
    const claims = await Claim.find()
      .populate("user_id", "name email city platform zone")
      .populate("policy_id", "plan_type weekly_premium")
      .sort({ timestamp: -1 });
    res.json(claims);
  } catch (err) {
    next(err);
  }
};

export const getFraudAlerts = async (req, res, next) => {
  try {
    const flagged = await Claim.find({
      $or: [{ status: "escrow" }, { status: "rejected" }],
    })
      .populate("user_id", "name email city platform zone")
      .sort({ fraud_score: -1 });
    res.json(flagged);
  } catch (err) {
    next(err);
  }
};
