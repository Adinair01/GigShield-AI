import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getProfile, getAllWorkers } from "../controllers/userController.js";
import { admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/profile", protect, getProfile);
router.get("/all", protect, admin, getAllWorkers);

export default router;
