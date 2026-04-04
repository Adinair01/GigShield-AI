import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  getMyClaims,
  getAllClaims,
  getFraudAlerts,
} from "../controllers/claimController.js";

const router = express.Router();

router.get("/mine", protect, getMyClaims);
router.get("/all", protect, admin, getAllClaims);
router.get("/fraud", protect, admin, getFraudAlerts);

export default router;
