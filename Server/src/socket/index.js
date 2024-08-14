import express from "express";
import { Server } from "socket.io";
import http from "http";
import userDetailsJsonWebToken from "../middleware/userDetailsJsonWebToken.js";
import UserModel from "../context/Users/User_model.js";
import {
  ConversationModel,
  MessageModel,
} from "../context/Conversation/Conversation_model.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// is User is online or not?

const onlineUser = new Set();

io.on("connection", async (socket) => {
  console.log("User connected", socket.id);

  const token = socket.handshake.auth.token;
  const userDetails = await userDetailsJsonWebToken(token);

  if (!userDetails) return;

  // Join the user to a room with their ID
  socket.join(userDetails._id.toString());

  // Mark user as online
  onlineUser.add(userDetails._id.toString());

  // Emit online users to all clients
  io.emit("onlineUser", Array.from(onlineUser));

  // Handle message page requests
  socket.on("message-page", async (userId) => {
    try {
      // Fetch user details of the requested userId
      const otherUserDetails = await UserModel.findById(userId).select("-password");

      if (!otherUserDetails) return;

      // Prepare user data payload
      const payload = {
        _id: otherUserDetails._id,
        name: otherUserDetails.name,
        profile_pic: otherUserDetails.profile_pic,
        email: otherUserDetails.email,
        phone: otherUserDetails.phone,
        online: onlineUser.has(userId),
      };

      // Emit user details to the client
      socket.emit("message-user", payload);

      // Fetch the conversation between the logged-in user and the other user
      const getConversationMessage = await ConversationModel.findOne({
        $or: [
          { sender: userDetails._id, receiver: userId },
          { sender: userId, receiver: userDetails._id },
        ],
      })
        .populate("messages")
        .sort({ updatedAt: -1 });

      // If a conversation exists, emit the messages
      if (getConversationMessage) {
        socket.emit("message", getConversationMessage.messages);
      } else {
        socket.emit("message", []); // Emit an empty array if no conversation exists
      }

    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  });

  // new message
  socket.on("new-message", async (data) => {
    try {
      // Find existing conversation or create a new one
      let conversation = await ConversationModel.findOne({
        $or: [
          { sender: data.sender, receiver: data.receiver },
          { sender: data.receiver, receiver: data.sender },
        ],
      });

      if (!conversation) {
        const createConversation = new ConversationModel({
          sender: data.sender,
          receiver: data.receiver,
        });

        conversation = await createConversation.save();
      }

      // Create a new message
      const message = new MessageModel({
        text: data?.text,
        imageUrl: data?.imageUrl, // Use the correct key
        videoUrl: data?.videoUrl, // Use the correct key
        msgByUserId: data?.msgByUserId,
      });

      const saveMessage = await message.save();

      // Update the conversation with the new message
      const updateConversation = await ConversationModel.updateOne(
        { _id: conversation?._id }, // Correct field name here
        {
          $push: { messages: saveMessage?._id }, // Correct field name here
        }
      );

      // Fetch the updated conversation with populated messages
      const getConversationMessage = await ConversationModel.findOne({
        $or: [
          { sender: data.sender, receiver: data.receiver },
          { sender: data.receiver, receiver: data.sender },
        ],
      })
        .populate("messages") // Ensure 'messages' is correct in your schema
        .sort({ updatedAt: -1 });

      // Emit the messages to both sender and receiver
      io.to(data.sender).emit("message", getConversationMessage.messages);
      io.to(data.receiver).emit("message", getConversationMessage.messages);

      console.log("getConversationMessage.messagesyyyyyy",getConversationMessage.messages);
      
    } catch (error) {
      console.error("Error processing new message:", error);
    }
  });

  // Handle disconnection event on the socket instance
  socket.on("disconnect", () => {
    onlineUser.delete(userDetails?._id);
    console.log("User disconnected", socket.id);
  });
});

// Correctly exporting the app and server using ES module syntax
export { app, server };
