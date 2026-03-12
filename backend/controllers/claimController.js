import Claim from "../models/Claim.js";
import { checkAndTriggerForCity, simulateRainstorm } from "../services/parametricTriggerService.js";

export const listClaims = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const claims = await Claim.find({ user_id: userId })
      .sort("-createdAt")
      .populate("policy_id");
    res.json(claims);
  } catch (err) {
    next(err);
  }
};

export const triggerClaimsForCity = async (req, res, next) => {
  try {
    const { city, curfew } = req.body;
    const result = await checkAndTriggerForCity(city, { curfew: !!curfew });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const demoRainstorm = async (req, res, next) => {
  try {
    const { city } = req.body;
    const result = await simulateRainstorm(city || "Mumbai");
    res.json(result);
  } catch (err) {
    next(err);
  }
};

