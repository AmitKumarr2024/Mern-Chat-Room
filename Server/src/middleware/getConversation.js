import { ConversationModel } from "../context/Conversation/Conversation_model.js";

const getConversation = async (currentUserId) => {
  try {
    const currentUserConversation = await ConversationModel.find({
      $or: [{ sender: currentUserId }, { receiver: currentUserId }],
    })
      .populate("sender", "name profile_pic") // Populate sender with specific fields
      .populate("receiver", "name profile_pic") // Populate receiver with specific fields
      .sort({ updatedAt: -1 })
      .populate("messages");

    const conversation = currentUserConversation.map((conv) => {
      const countUnseenMsg = conv.messages.reduce((prev, curr) => {
        const msgByUserId = curr?.msgByUserId?.toString();
        if (msgByUserId !== currentUserId) {
          return prev + (curr.seen ? 0 : 1);
        } else {
          return prev;
        }
      }, 0);
      return {
        _id: conv?._id,
        sender: conv?.sender,
        receiver: conv?.receiver,
        unseenMsg: countUnseenMsg,
        lastMsg: conv.messages[conv?.messages?.length - 1],
      };
    });
    return conversation;
  } catch (error) {
    console.error("get sidebar conversation", error);
  }
};
export default getConversation;
