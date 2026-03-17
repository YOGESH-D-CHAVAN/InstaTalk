import Message from "../models/message.model.js";
import Chat from "../models/chat.model.js";

export const sendMessage = async (req, res) => {
  try {
    const { content, chatId, attachments } = req.body;

    if ((!content && (!attachments || attachments.length === 0)) || !chatId) {
      return res.status(400).json({ message: "Invalid data" });
    }

    let message = await Message.create({
      sender: req.user._id,
      content,
      attachments,
      chat: chatId,
    });

    message = await message.populate("sender", "username avatar");

    await Chat.findByIdAndUpdate(chatId, { updatedAt: new Date() });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: "Failed to send message", error: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "username avatar")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch messages", error: error.message });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    
    // Validate messageId format
    if (!messageId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid message ID format" });
    }

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Optional: Check if the requester is the sender
    if (String(message.sender) !== String(req.user._id)) {
      return res.status(401).json({ message: "You can only delete your own messages" });
    }

    await Message.findByIdAndDelete(messageId);
    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete message", error: error.message });
  }
};

export const clearChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    
    // Check if user is part of the chat
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.participants.includes(req.user._id)) {
      return res.status(401).json({ message: "Unauthorized to clear this chat" });
    }

    await Message.deleteMany({ chat: chatId });
    res.status(200).json({ message: "Chat cleared successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to clear chat", error: error.message });
  }
};
