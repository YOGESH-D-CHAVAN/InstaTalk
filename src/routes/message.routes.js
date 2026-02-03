import express from "express";
import {
  sendMessage,
  getMessages,
} from "../controllers/message.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// send message
router.post("/", protect, sendMessage);

// get all messages of a chat
router.get("/:chatId", protect, getMessages);

export default router;
