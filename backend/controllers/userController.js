import User from "../models/User.js";

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-passwordHash");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

export const getAllWorkers = async (req, res, next) => {
  try {
    const workers = await User.find({ role: "worker" })
      .select("-passwordHash")
      .sort({ createdAt: -1 });
    res.json(workers);
  } catch (err) {
    next(err);
  }
};
