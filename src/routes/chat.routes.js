import express from "express";
import { accessChat, fetchChats, markAsRead } from "../controllers/chat.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// create or get private chat
router.post("/", protect, accessChat);

// get all chats for the logged in user
router.get("/", protect, fetchChats);

// mark chat as read
router.put("/read/:chatId", protect, markAsRead);

export default router;
