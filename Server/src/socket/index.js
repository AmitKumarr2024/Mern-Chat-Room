import express from "express";
import { Server } from "socket.io";
import http from "http";
import jwt from "jsonwebtoken";
import userDetailsJsonWebToken from "../middleware/userDetailsJsonWebToken.js";
import UserModel from "../context/Users/User_model.js";
import { ConversationModel, MessageModel } from "../context/Conversation/Conversation_model.js";
import getConversation from "../middleware/getConversation.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URLS,
    credentials: true,
  }
});

console.log('FRONTEND_URLS:', process.env.FRONTEND_URLS);

const onlineUser = new Set();

// Middleware to verify token
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      console.error('Token missing from handshake');
      return next(new Error('Session ID unknown'));
    }

    const userDetails = await userDetailsJsonWebToken(token);
    if (!userDetails || !userDetails._id) {
      console.error('User authentication failed or userDetails._id is undefined:', userDetails);
      return next(new Error('Session ID unknown'));
    }

    // Attach user details to socket object
    socket.userDetails = userDetails;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    next(new Error('Session ID unknown'));
  }
});

io.on('connection', async (socket) => {
  const { _id: userId } = socket.userDetails;

  try {
    socket.join(userId.toString());
    onlineUser.add(userId.toString());
    io.emit('onlineUser', Array.from(onlineUser));

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
            { sender: userId, receiver: socket.userDetails._id },
            { sender: socket.userDetails._id, receiver: userId },
          ],
        }).populate('messages').sort({ updatedAt: -1 });

        socket.emit('message', conversation ? conversation.messages : []);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    });

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
        }).populate('messages').sort({ updatedAt: -1 });

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

    socket.on('sidebar', async (currentUserId) => {
      try {
        const conversation = await getConversation(currentUserId);
        socket.emit('conversation', conversation);
      } catch (error) {
        console.error('Error fetching sidebar:', error);
      }
    });

    socket.on('seen', async (msgByUserId) => {
      try {
        const conversation = await ConversationModel.findOne({
          $or: [
            { sender: userId, receiver: msgByUserId },
            { sender: msgByUserId, receiver: userId },
          ],
        });

        const messageIds = conversation?.messages || [];
        await MessageModel.updateMany(
          { _id: { $in: messageIds }, msgByUserId },
          { $set: { seen: true } }
        );

        const sidebarSender = await getConversation(userId.toString());
        const sidebarReceiver = await getConversation(msgByUserId);

        io.to(userId.toString()).emit('conversation', sidebarSender);
        io.to(msgByUserId).emit('conversation', sidebarReceiver);
      } catch (error) {
        console.error('Error marking messages as seen:', error);
      }
    });

  } catch (error) {
    console.error('Connection error:', error);
    socket.disconnect();
  }

  socket.on('disconnect', () => {
    if (userId) {
      onlineUser.delete(userId.toString());
      io.emit('onlineUser', Array.from(onlineUser));
    }
  });
});

export { app, server };
