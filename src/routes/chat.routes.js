import express from "express";
import { accessChat, fetchChats, deleteChat } from "../controllers/chat.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// create or get private chat
router.post("/", protect, accessChat);

// get all chats for the logged in user
router.get("/", protect, fetchChats);

// delete chat
router.delete("/:chatId", protect, deleteChat);

export default router;
