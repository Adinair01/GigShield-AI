import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  simulateRain,
  simulateAqi,
  simulateShutdown,
  getEvents,
} from "../controllers/simulateController.js";

const router = express.Router();

// All simulation endpoints require admin access
router.post("/rain", protect, admin, simulateRain);
router.post("/aqi", protect, admin, simulateAqi);
router.post("/shutdown", protect, admin, simulateShutdown);
router.get("/events", protect, admin, getEvents);

export default router;
