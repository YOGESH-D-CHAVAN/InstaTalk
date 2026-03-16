import Chat from "../models/chat.model.js";

export const accessChat = async (req, res) => {
  try {
    const { userId } = req.body;

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

export const markAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    // Reset unread count for this user
    chat.unreadCounts.set(String(req.user._id), 0);
    await chat.save();

    res.status(200).json({ message: "Chat marked as read", chat });
  } catch (error) {
    res.status(500).json({ message: "Failed to mark chat as read", error: error.message });
  }
};
