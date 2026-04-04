import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  createPolicy,
  getMyPolicies,
  getAllPolicies,
  getPlans,
} from "../controllers/policyController.js";

const router = express.Router();

router.get("/plans", protect, getPlans);
router.post("/", protect, createPolicy);
router.get("/mine", protect, getMyPolicies);
router.get("/all", protect, admin, getAllPolicies);

export default router;
