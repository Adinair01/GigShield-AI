import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import { getMyRiskScore, getAnalytics } from "../controllers/riskController.js";

const router = express.Router();

router.get("/score", protect, getMyRiskScore);
router.get("/analytics", protect, admin, getAnalytics);

export default router;

