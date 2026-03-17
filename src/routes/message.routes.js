import express from "express";
import {
  sendMessage,
  getMessages,
  deleteMessage,
  clearChat,
} from "../controllers/message.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// test route
router.get("/test", (req, res) => res.send("Message routes are active 📩"));

// send message
router.post("/", protect, sendMessage);

// get all messages of a chat
router.get("/:chatId", protect, getMessages);

// delete message
router.delete("/:messageId", protect, deleteMessage);

// clear chat
router.delete("/clear/:chatId", protect, clearChat);

export default router;
