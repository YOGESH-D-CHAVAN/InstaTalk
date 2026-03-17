import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { getAllUsers, updateProfile } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/", protect, getAllUsers);

// update profile
router.patch("/profile", protect, updateProfile);

export default router;
