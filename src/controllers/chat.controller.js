import Chat from "../models/chat.model.js";

export const accessChat = async (req, res) => {
  const { userId } = req.body;

  // check existing chat
  let chat = await Chat.findOne({
    isGroupChat: false,
    participants: {
      $all: [req.user._id, userId],
    },
  });

  if (!chat) {
    chat = await Chat.create({
      participants: [req.user._id, userId],
    });
  }

  res.status(200).json(chat);
};
