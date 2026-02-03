import Message from "../models/message.model.js";

export const sendMessage = async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    return res.status(400).json({ message: "Invalid data" });
  }

  const message = await Message.create({
    sender: req.user._id,
    content,
    chat: chatId,
  });

  res.status(201).json(message);
};

export const getMessages = async (req, res) => {
  const messages = await Message.find({ chat: req.params.chatId })
    .populate("sender", "username avatar")
    .sort({ createdAt: 1 });

  res.status(200).json(messages);
};
