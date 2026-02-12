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
