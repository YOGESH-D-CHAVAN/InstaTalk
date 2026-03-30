import Connection from "../models/connection.model.js";
import User from "../models/user.model.js";

export const sendRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user._id;

    if (String(senderId) === String(receiverId)) {
      return res.status(400).json({ message: "You cannot send a request to yourself" });
    }

    // Check if a connection already exists
    const existingConnection = await Connection.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    });

    if (existingConnection) {
      return res.status(400).json({ message: "Connection request already exists or you are already connected" });
    }

    const newConnection = await Connection.create({
      sender: senderId,
      receiver: receiverId,
      status: "pending",
    });

    res.status(201).json(newConnection);
  } catch (error) {
    res.status(500).json({ message: "Failed to send connection request", error: error.message });
  }
};

export const acceptRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    const connection = await Connection.findById(requestId);

    if (!connection) {
      return res.status(404).json({ message: "Connection request not found" });
    }

    if (String(connection.receiver) !== String(userId)) {
      return res.status(403).json({ message: "You are not authorized to accept this request" });
    }

    connection.status = "accepted";
    await connection.save();

    res.status(200).json(connection);
  } catch (error) {
    res.status(500).json({ message: "Failed to accept connection request", error: error.message });
  }
};

export const rejectRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    const connection = await Connection.findById(requestId);

    if (!connection) {
      return res.status(404).json({ message: "Connection request not found" });
    }

    if (String(connection.receiver) !== String(userId) && String(connection.sender) !== String(userId)) {
      return res.status(403).json({ message: "You are not authorized to reject/cancel this request" });
    }

    await Connection.findByIdAndDelete(requestId);

    res.status(200).json({ message: "Connection request removed" });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove connection request", error: error.message });
  }
};

export const getPendingRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const requests = await Connection.find({
      receiver: userId,
      status: "pending",
    }).populate("sender", "username email avatar");

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch pending requests", error: error.message });
  }
};

export const getMyConnections = async (req, res) => {
  try {
    const userId = req.user._id;

    const connections = await Connection.find({
      $or: [
        { sender: userId, status: "accepted" },
        { receiver: userId, status: "accepted" },
      ],
    }).populate("sender receiver", "username email avatar");

    res.status(200).json(connections);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch connections", error: error.message });
  }
};
