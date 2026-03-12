import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  listClaims,
  triggerClaimsForCity,
  demoRainstorm,
} from "../controllers/claimController.js";

const router = express.Router();

router.get("/", protect, listClaims);

// Admin / system-triggered endpoints
router.post("/trigger", protect, admin, triggerClaimsForCity);
router.post("/simulate-rainstorm", protect, admin, demoRainstorm);

export default router;

