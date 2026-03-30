import Chat from "../models/chat.model.js";
import Connection from "../models/connection.model.js";

export const accessChat = async (req, res) => {
  try {
    const { userId } = req.body;

    // Check ifusers are connected
    const connection = await Connection.findOne({
      status: "accepted",
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id },
      ],
    });

    if (!connection) {
      return res.status(403).json({ message: "You must be connected to this user to chat" });
    }

    // check existing chat
    let chat = await Chat.findOne({
      isGroupChat: false,
      participants: {
        $all: [req.user._id, userId],
      },
    }).populate("participants", "-password");

    if (!chat) {
      chat = await Chat.create({
        participants: [req.user._id, userId],
      });
      chat = await chat.populate("participants", "-password");
    }

    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json({ message: "Error accessing chat", error: error.message });
  }
};

export const fetchChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("participants", "-password")
      .sort({ updatedAt: -1 });

    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch chats", error: error.message });
  }
};

export const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.participants.includes(req.user._id)) {
      return res.status(401).json({ message: "Unauthorized to delete this chat" });
    }

    await Chat.findByIdAndDelete(chatId);
    // Also delete all messages associated with this chat
    await import("../models/message.model.js").then(async (Message) => {
       await Message.default.deleteMany({ chat: chatId });
    });

    res.status(200).json({ message: "Chat deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete chat", error: error.message });
  }
};
