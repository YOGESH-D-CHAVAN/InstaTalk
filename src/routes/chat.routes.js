import express from "express";
import { accessChat } from "../controllers/chat.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// create or get private chat
router.post("/", protect, accessChat);

export default router;
