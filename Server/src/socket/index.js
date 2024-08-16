// Import necessary modules
import express from "express";
import { Server } from "socket.io";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import userDetailsJsonWebToken from "../middleware/userDetailsJsonWebToken.js";
import UserModel from "../context/Users/User_model.js";
import {
  ConversationModel,
  MessageModel,
} from "../context/Conversation/Conversation_model.js";
import getConversation from "../middleware/getConversation.js";

// Load environment variables from .env file
dotenv.config();

// Ensure necessary environment variables are set
if (!process.env.FRONTEND_URLS) {
  throw new Error("FRONTEND_URLS environment variable is not set");
}

const app = express();

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URLS ? "http://localhost:5173/" : [],
    methods: "GET, POST, PUT, DELETE",
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const onlineUser = new Set();

io.engine.on("connection_error", (err) => {
  console.error("Connection error details:", err);
});

io.on("connection", async (socket) => {
  console.log("User connected: ", socket.id);
  let userDetails;

  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      console.error("Token missing from handshake");
      socket.disconnect();
      return;
    }

    try {
      userDetails = await userDetailsJsonWebToken(token);
      if (!userDetails || !userDetails._id) {
        console.error("Invalid token or user details");
        socket.disconnect();
        return;
      }
    } catch (error) {
      console.error("Token verification failed:", error);
      socket.disconnect();
      return;
    }

    socket.join(userDetails._id.toString());
    onlineUser.add(userDetails._id.toString());
    io.emit("onlineUser", Array.from(onlineUser));

    // Event listeners
    socket.on("message-page", async (userId) => {
      try {
        const otherUserDetails = await UserModel.findById(userId).select(
          "-password"
        );
        if (!otherUserDetails) return;

        const payload = {
          _id: otherUserDetails._id,
          name: otherUserDetails.name,
          profile_pic: otherUserDetails.profile_pic,
          email: otherUserDetails.email,
          phone: otherUserDetails.phone,
          online: onlineUser.has(userId),
        };

        socket.emit("message-user", payload);

        const conversation = await ConversationModel.findOne({
          $or: [
            { sender: userDetails._id, receiver: userId },
            { sender: userId, receiver: userDetails._id },
          ],
        })
          .populate("messages")
          .sort({ updatedAt: -1 });

        socket.emit("message", conversation ? conversation.messages : []);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    });

    socket.on("new-message", async (data) => {
      try {
        let conversation = await ConversationModel.findOne({
          $or: [
            { sender: data.sender, receiver: data.receiver },
            { sender: data.receiver, receiver: data.sender },
          ],
        });

        if (!conversation) {
          conversation = new ConversationModel({
            sender: data.sender,
            receiver: data.receiver,
          });
          await conversation.save();
        }

        const message = new MessageModel({
          text: data.text,
          imageUrl: data.imageUrl,
          videoUrl: data.videoUrl,
          msgByUserId: data.msgByUserId,
        });

        const savedMessage = await message.save();
        await ConversationModel.updateOne(
          { _id: conversation._id },
          { $push: { messages: savedMessage._id } }
        );

        const updatedConversation = await ConversationModel.findOne({
          $or: [
            { sender: data.sender, receiver: data.receiver },
            { sender: data.receiver, receiver: data.sender },
          ],
        })
          .populate("messages")
          .sort({ updatedAt: -1 });

        io.to(data.sender).emit("message", updatedConversation.messages);
        io.to(data.receiver).emit("message", updatedConversation.messages);

        const sidebarSender = await getConversation(data.sender);
        const sidebarReceiver = await getConversation(data.receiver);

        io.to(data.sender).emit("conversation", sidebarSender);
        io.to(data.receiver).emit("conversation", sidebarReceiver);
      } catch (error) {
        console.error("Error processing new message:", error);
      }
    });

    socket.on("sidebar", async (currentUserId) => {
      try {
        const conversation = await getConversation(currentUserId);
        socket.emit("conversation", conversation);
      } catch (error) {
        console.error("Error fetching sidebar:", error);
      }
    });

    socket.on("seen", async (msgByUserId) => {
      try {
        const conversation = await ConversationModel.findOne({
          $or: [
            { sender: userDetails._id, receiver: msgByUserId },
            { sender: msgByUserId, receiver: userDetails._id },
          ],
        });

        const messageIds = conversation?.messages || [];
        await MessageModel.updateMany(
          { _id: { $in: messageIds }, msgByUserId },
          { $set: { seen: true } }
        );

        const sidebarSender = await getConversation(userDetails._id.toString());
        const sidebarReceiver = await getConversation(msgByUserId);

        io.to(userDetails._id.toString()).emit("conversation", sidebarSender);
        io.to(msgByUserId).emit("conversation", sidebarReceiver);
      } catch (error) {
        console.error("Error marking messages as seen:", error);
      }
    });
  } catch (error) {
    console.error("Connection error:", error);
    socket.disconnect();
  }

  socket.on("disconnect", () => {
    if (userDetails && userDetails._id) {
      onlineUser.delete(userDetails._id.toString());
      io.emit("onlineUser", Array.from(onlineUser));
      console.log("User disconnected:", socket.id);
    }
  });
});

export { app, server };
