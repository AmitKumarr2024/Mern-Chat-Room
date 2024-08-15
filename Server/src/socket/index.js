import express from "express";
import { Server } from "socket.io";
import http from "http";
import userDetailsJsonWebToken from "../middleware/userDetailsJsonWebToken.js";
import UserModel from "../context/Users/User_model.js";
import { ConversationModel, MessageModel } from "../context/Conversation/Conversation_model.js";
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
  console.log("connect User ", socket.id);
  let userDetails;

  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      console.error('Token missing from handshake');
      socket.disconnect();
      return;
    }

    userDetails = await userDetailsJsonWebToken(token);

    if (!userDetails || !userDetails._id) {
      console.error('User authentication failed or userDetails._id is undefined:', userDetails);
      socket.disconnect();
      return;
    }

    socket.join(userDetails._id.toString());
    onlineUser.add(userDetails._id.toString());
    io.emit('onlineUser', Array.from(onlineUser));

    socket.on('message-page', async (userId) => {
      try {
        console.log('userId', userId);
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

        // Get previous messages
        const conversation = await ConversationModel.findOne({
          $or: [
            { sender: userDetails._id, receiver: userId },
            { sender: userId, receiver: userDetails._id },
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

        // Send conversation for sidebar
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
        console.log("current user", currentUserId);
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
            { sender: userDetails._id, receiver: msgByUserId },
            { sender: msgByUserId, receiver: userDetails._id },
          ],
        });

        const messageIds = conversation?.messages || [];
        await MessageModel.updateMany(
          { _id: { $in: messageIds }, msgByUserId },
          { $set: { seen: true } }
        );

        // Send updated conversations
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
    socket.disconnect();
  }

  socket.on('disconnect', () => {
    if (userDetails && userDetails._id) {
      onlineUser.delete(userDetails._id.toString());
      io.emit('onlineUser', Array.from(onlineUser));
      console.log('disconnect user ', socket.id);
    }
  });
});

export { app, server };
