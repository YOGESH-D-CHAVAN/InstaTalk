import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    content: {
      type: String,
      trim: true,
    },
    attachments: [
      {
        url: { type: String, required: true },
        type: { type: String, required: true }, // image, video, document
        name: { type: String },
      },
    ],
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
export default Message;
