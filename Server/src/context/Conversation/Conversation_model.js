import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      default: "",
    },
    imageUrl: {
      type: String,
      default: "",
    },
    videoUrl: {
      type: String,
      default: "",
    },
    seen: {
      type: Boolean,
      default: false,
    },
    msgByUserId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "User", // Ensure this matches the User model name
    },
  },
  {
    timestamps: true,
  }
);

const conversationSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "User", // Ensure this matches the User model name
    },
    receiver: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "User", // Ensure this matches the User model name
    },
    messages: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Message", // Ensure this matches the Message model name
      },
    ],
  },
  {
    timestamps: true,
  }
);

const ConversationModel = mongoose.model("Conversation", conversationSchema);
const MessageModel = mongoose.model("Message", messageSchema);

export { ConversationModel, MessageModel };
