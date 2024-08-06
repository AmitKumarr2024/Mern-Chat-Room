import mongoose from "mongoose";

const messageShema = new mongoose.Schema(
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
  },
  {
    timestamps: true,
  }
);

// for conversation

const conversationSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: "user",
    },
    receiver: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: "user",
    },
    messages: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "message",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const ConversationModel = mongoose.model("Conversation", conversationSchema);
const MessageModel = mongoose.model("message", messageShema);

export default { ConversationModel, messageShema };
