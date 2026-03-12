import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import Policy from "../models/Policy.js";
import Claim from "../models/Claim.js";

const router = express.Router();

router.get("/me", protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-passwordHash");
    const activePolicy = await Policy.findOne({
      user_id: user._id,
      status: "active",
    });
    const claims = await Claim.find({ user_id: user._id })
      .sort("-createdAt")
      .limit(5);

    res.json({
      user,
      activePolicy,
      recentClaims: claims,
    });
  } catch (err) {
    next(err);
  }
});

export default router;

