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

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URLS.split(','), // Ensure FRONTEND_URLS is a comma-separated string
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Array of allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'],  // Array of allowed headers
  },
});


// is User is online or not?

const onlineUser = new Set();

io.on("connection", async (socket) => {
  let userDetails; // Declare userDetails in a broader scope

  try {
    const token = socket.handshake.auth.token;
    userDetails = await userDetailsJsonWebToken(token);

    if (!userDetails) return;

    // Join the user to a room with their ID
    socket.join(userDetails._id.toString());

    // Mark user as online
    onlineUser.add(userDetails._id.toString());

    // Emit online users to all clients
    io.emit("onlineUser", Array.from(onlineUser));

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

        const getConversationMessage = await ConversationModel.findOne({
          $or: [
            { sender: userDetails._id, receiver: userId },
            { sender: userId, receiver: userDetails._id },
          ],
        })
          .populate("messages")
          .sort({ updatedAt: -1 });

        if (getConversationMessage) {
          socket.emit("message", getConversationMessage.messages);
        } else {
          socket.emit("message", []);
        }
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
          const createConversation = new ConversationModel({
            sender: data.sender,
            receiver: data.receiver,
          });

          conversation = await createConversation.save();
        }

        const message = new MessageModel({
          text: data?.text,
          imageUrl: data?.imageUrl,
          videoUrl: data?.videoUrl,
          msgByUserId: data?.msgByUserId,
        });

        const saveMessage = await message.save();

        await ConversationModel.updateOne(
          { _id: conversation?._id },
          {
            $push: { messages: saveMessage?._id },
          }
        );

        const getConversationMessage = await ConversationModel.findOne({
          $or: [
            { sender: data.sender, receiver: data.receiver },
            { sender: data.receiver, receiver: data.sender },
          ],
        })
          .populate("messages")
          .sort({ updatedAt: -1 });

        io.to(data.sender).emit("message", getConversationMessage.messages);
        io.to(data.receiver).emit("message", getConversationMessage.messages);

        const conversationSideBarSender = await getConversation(data.sender);
        const conversationSideBarReceiver = await getConversation(data.receiver);

        io.to(data.sender).emit("conversation", conversationSideBarSender);
        io.to(data.receiver).emit("conversation", conversationSideBarReceiver);
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
        let conversation = await ConversationModel.findOne({
          $or: [
            { sender: userDetails._id, receiver: msgByUserId },
            { sender: msgByUserId, receiver: userDetails._id },
          ],
        });

        const conversationMessageId = conversation?.messages || [];
        await MessageModel.updateMany(
          {
            _id: { $in: conversationMessageId },
            msgByUserId: msgByUserId,
          },
          { $set: { seen: true } }
        );

        const conversationSideBarSender = await getConversation(
          userDetails._id.toString()
        );
        const conversationSideBarReceiver = await getConversation(msgByUserId);

        io.to(userDetails._id.toString()).emit(
          "conversation",
          conversationSideBarSender
        );
        io.to(msgByUserId).emit("conversation", conversationSideBarReceiver);
      } catch (error) {
        console.error("Error marking messages as seen:", error);
      }
    });
  } catch (error) {
    console.error("Connection error:", error);
  }

  // Handle user disconnection
  socket.on("disconnect", () => {
    if (userDetails) {
      onlineUser.delete(userDetails._id.toString()); // Ensure safe deletion
    }
  });
});




// Correctly exporting the app and server using ES module syntax
export { app, server };
