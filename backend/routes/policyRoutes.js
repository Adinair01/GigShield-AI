import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  listPolicies,
  createPolicy,
  recommendedPlans,
} from "../controllers/policyController.js";

const router = express.Router();

router.get("/", protect, listPolicies);
router.post("/create", protect, createPolicy);
router.get("/recommended", protect, recommendedPlans);

export default router;

