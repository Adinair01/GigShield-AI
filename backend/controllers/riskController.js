import User from "../models/User.js";
import Claim from "../models/Claim.js";
import Policy from "../models/Policy.js";
import WeatherEvent from "../models/WeatherEvent.js";

export const getMyRiskScore = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ risk_score: user?.risk_score || 0 });
  } catch (err) {
    next(err);
  }
};

export const getAnalytics = async (req, res, next) => {
  try {
    const totalWorkers = await User.countDocuments({ role: "worker" });
    const activePolicies = await Policy.countDocuments({ status: "active" });
    const totalClaims = await Claim.countDocuments();
    const paidClaims = await Claim.find({ status: "paid" });

    const totalPayout = paidClaims.reduce(
      (sum, c) => sum + (c.payout_amount || 0),
      0
    );

    const premiums = await Policy.aggregate([
      { $match: { status: "active" } },
      {
        $group: {
          _id: null,
          totalPremiums: { $sum: "$weekly_premium" },
        },
      },
    ]);

    const totalPremiums = premiums[0]?.totalPremiums || 0;
    const lossRatio =
      totalPremiums > 0 ? Number((totalPayout / totalPremiums).toFixed(2)) : 0;

    // Claims per city
    const claimsPerCityAgg = await Claim.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $group: {
          _id: "$user.city",
          count: { $sum: 1 },
        },
      },
    ]);

    const claimsPerCity = claimsPerCityAgg.map((c) => ({
      city: c._id,
      count: c.count,
    }));

    // Weather disruption patterns (simple count per trigger type)
    const weatherAgg = await WeatherEvent.aggregate([
      {
        $group: {
          _id: "$city",
          events: { $sum: 1 },
        },
      },
    ]);

    const weatherPatterns = weatherAgg.map((w) => ({
      city: w._id,
      events: w.events,
    }));

    res.json({
      totalWorkers,
      activePolicies,
      totalClaims,
      totalPayout,
      totalPremiums,
      lossRatio,
      claimsPerCity,
      weatherPatterns,
    });
  } catch (err) {
    next(err);
  }
};

