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

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const claimsToday = await Claim.countDocuments({
      timestamp: { $gte: todayStart },
    });

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

    // Fraud alerts count
    const fraudAlerts = await Claim.countDocuments({
      $or: [{ status: "escrow" }, { status: "rejected" }],
    });

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

    // Claims by trigger type
    const claimsByTrigger = await Claim.aggregate([
      {
        $group: {
          _id: "$trigger_type",
          count: { $sum: 1 },
          totalPayout: { $sum: "$payout_amount" },
        },
      },
    ]);

    // Weather disruption patterns
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

    // Recent events
    const recentEvents = await WeatherEvent.find()
      .sort({ timestamp: -1 })
      .limit(10);

    res.json({
      totalWorkers,
      activePolicies,
      totalClaims,
      claimsToday,
      totalPayout,
      totalPremiums,
      lossRatio,
      fraudAlerts,
      claimsPerCity,
      claimsByTrigger,
      weatherPatterns,
      recentEvents,
    });
  } catch (err) {
    next(err);
  }
};
