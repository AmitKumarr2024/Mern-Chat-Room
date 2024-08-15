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
    origin: process.env.FRONTEND_URLS, // Ensure FRONTEND_URLS is set correctly
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  }
});

console.log('FRONTEND_URLS:', process.env.FRONTEND_URLS);

// Keep track of online users
const onlineUser = new Set();

io.on('connection', async (socket) => {
  let userDetails;

  try {
    // Extract token from socket handshake
    const token = socket.handshake.auth?.token;
    if (!token) {
      console.error('Token missing from handshake');
      socket.disconnect();
      return;
    }

    console.log('Token received:', token); // Log token received

    userDetails = await userDetailsJsonWebToken(token);

    if (!userDetails || !userDetails._id) {
      console.error('User authentication failed or userDetails._id is undefined:', userDetails);
      socket.disconnect();
      return;
    }

    console.log('User details:', userDetails); // Log user details

    // Join the user to their unique room
    socket.join(userDetails._id.toString());

    // Mark user as online
    onlineUser.add(userDetails._id.toString());
    io.emit('onlineUser', Array.from(onlineUser));

    // Handle message-page event
    socket.on('message-page', async (userId) => {
      try {
        const otherUserDetails = await UserModel.findById(userId).select('-password');
        if (!otherUserDetails) return;

        const payload = {
          _id: otherUserDetails._id,
          name: otherUserDetails.name,
          profile_pic: otherUserDetails.profile_pic,
          email: otherUserDetails.email,
          phone: otherUserDetails.phone,
          online: onlineUser.has(userId),
        };

        socket.emit('message-user', payload);

        const conversation = await ConversationModel.findOne({
          $or: [
            { sender: userDetails._id, receiver: userId },
            { sender: userId, receiver: userDetails._id },
          ],
        })
          .populate('messages')
          .sort({ updatedAt: -1 });

        socket.emit('message', conversation ? conversation.messages : []);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    });

    // Handle new-message event
    socket.on('new-message', async (data) => {
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
          .populate('messages')
          .sort({ updatedAt: -1 });

        io.to(data.sender).emit('message', updatedConversation.messages);
        io.to(data.receiver).emit('message', updatedConversation.messages);

        const sidebarSender = await getConversation(data.sender);
        const sidebarReceiver = await getConversation(data.receiver);

        io.to(data.sender).emit('conversation', sidebarSender);
        io.to(data.receiver).emit('conversation', sidebarReceiver);
      } catch (error) {
        console.error('Error processing new message:', error);
      }
    });

    // Handle sidebar event
    socket.on('sidebar', async (currentUserId) => {
      try {
        const conversation = await getConversation(currentUserId);
        socket.emit('conversation', conversation);
      } catch (error) {
        console.error('Error fetching sidebar:', error);
      }
    });

    // Handle seen event
    socket.on('seen', async (msgByUserId) => {
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

        io.to(userDetails._id.toString()).emit('conversation', sidebarSender);
        io.to(msgByUserId).emit('conversation', sidebarReceiver);
      } catch (error) {
        console.error('Error marking messages as seen:', error);
      }
    });
  } catch (error) {
    console.error('Connection error:', error);
  }

  // Handle disconnection
  socket.on('disconnect', () => {
    if (userDetails && userDetails._id) {
      onlineUser.delete(userDetails._id.toString());
      io.emit('onlineUser', Array.from(onlineUser));
    }
  });
});

export { app, server };
