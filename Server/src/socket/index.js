// Import necessary modules
import express from "express";
import { Server } from "socket.io";
import http from "http";
import userDetailsJsonWebToken from "../middleware/userDetailsJsonWebToken.js";
import UserModel from "../context/Users/User_model.js";
import {
  ConversationModel,
  MessageModel,
} from "../context/Conversation/Conversation_model.js";
import getConversation from "../middleware/getConversation.js";

// Ensure necessary environment variables are set
if (!process.env.FRONTEND_URLS) {
  throw new Error("FRONTEND_URLS environment variable is not set");
}

const app = express();

// CORS configuration
// const allowedOrigins = process.env.FRONTEND_URLS
//   ? process.env.FRONTEND_URLS.split(",")
//   : [];

const server = http.createServer(app);

const io = new Server(server, {
  pingInterval: 25000, // How often pings are sent
  pingTimeout: 60000, // How long to wait for a pong before closing
  cors: {
    origin: process.env.FRONTEND_URLS.split(","),
    credentials: true,
  },
});

// origin: (origin, callback) => {
//   if (!origin || allowedOrigins.includes(origin)) {
//     callback(null, true);
//   } else {
//     callback(new Error("Not allowed by CORS"));
//   }
// },
// methods: ["GET", "POST", "PUT", "DELETE"],
// allowedHeaders: ["Content-Type", "Authorization"],
// credentials: true,

const onlineUser = new Set();

io.engine.on("connection_error", (err) => {
  console.error("Connection error details:", err);
});

io.on("connection", async (socket) => {
  console.log("User-connected ::", socket.id);

  const token = socket.handshake.auth.token;

  try {
    const userDetails = await userDetailsJsonWebToken(token);

    socket.join(userDetails?._id.toString());
    onlineUser.add(userDetails?._id.toString());
    io.emit("onlineUser", Array.from(onlineUser));

    // Event listeners
    socket.on("message-page", async (userId) => {
      console.log("userId", userId);
      try {
        const otherUserDetails = await UserModel.findById(userId).select(
          "-password"
        );
        if (!otherUserDetails) return;

        const payload = {
          _id: otherUserDetails?._id,
          name: otherUserDetails?.name,
          profile_pic: otherUserDetails?.profile_pic,
          email: otherUserDetails?.email,
          phone: otherUserDetails?.phone,
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
    onlineUser.delete(userDetails?._id?.toString());
    console.log("User disconnected:", socket.id);
  });
});

export { app, server };
