import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  sendRequest,
  acceptRequest,
  rejectRequest,
  getPendingRequests,
  getMyConnections,
} from "../controllers/connection.controller.js";

const router = express.Router();

router.post("/send", protect, sendRequest);
router.put("/accept/:requestId", protect, acceptRequest);
router.delete("/reject/:requestId", protect, rejectRequest);
router.get("/pending", protect, getPendingRequests);
router.get("/", protect, getMyConnections);

export default router;
