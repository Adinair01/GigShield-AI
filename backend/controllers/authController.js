import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { calculateRiskScoreForUser } from "../services/riskEngine.js";

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || "devsecret", {
    expiresIn: "7d",
  });

export const register = async (req, res, next) => {
  try {
    const { name, email, password, platform, city, zone, avg_daily_income } =
      req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password || "password123", 10);

    const user = await User.create({
      name,
      email,
      passwordHash,
      platform,
      city,
      zone,
      avg_daily_income,
    });

    const risk_score = await calculateRiskScoreForUser(user);
    user.risk_score = risk_score;
    await user.save();

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      platform: user.platform,
      city: user.city,
      zone: user.zone,
      avg_daily_income: user.avg_daily_income,
      risk_score: user.risk_score,
      token: generateToken(user._id),
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password || "", user.passwordHash);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      platform: user.platform,
      city: user.city,
      zone: user.zone,
      avg_daily_income: user.avg_daily_income,
      risk_score: user.risk_score,
      token: generateToken(user._id),
      role: user.role,
    });
  } catch (err) {
    next(err);
  }
};

