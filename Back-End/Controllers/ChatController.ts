import expressAsyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import { ChatRoom } from '../Models/ChatRoomModel';
import { Message } from '../Models/MessageModel';
import TheaterDetails from '../Models/TheaterDetailsModel';
import { CustomRequest } from '../Middlewares/AdminAuthMiddleware';

class ChatRoomController {
  getChatRooms = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const theaterOwnerId = (req as any).theaterOwner._id;
    
    const chatRooms = await ChatRoom.find({ theaterOwnerId }).populate('adminId', 'name');

    const chatRoomsWithUnreadCount = await Promise.all(
      chatRooms.map(async (room) => {
        const unreadMessagesCount = await Message.countDocuments({
          chatRoomId: room._id,
          senderType: 'Admin',
          read: false,
        });
        return {
          ...room.toObject(),
          unreadMessagesCount,
        };
      })
    );

    res.json(chatRoomsWithUnreadCount);
  });

  createChatRoom = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {

    console.log("llll");

    const { adminId } = req.body;
    const theaterOwnerId = (req as any).theaterOwner._id;

    console.log("body: ", req.body);
    console.log("theaterOwnerId: ", theaterOwnerId);

    let chatRoom = await ChatRoom.findOne({ adminId, theaterOwnerId });

    console.log("chatRoom: ", chatRoom);

    if (!chatRoom) {
      chatRoom = await ChatRoom.create({ adminId, theaterOwnerId });
      console.log("created chatRoom: ", chatRoom);
    }

    res.status(201).json(chatRoom);
  });

  getMessages = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const messages = await Message.find({ chatRoomId: req.params.chatRoomId }).sort('timestamp');
    res.json(messages);
  });

  sendMessage = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const chatRoomId = req.params.chatRoomId;

    const { content, senderType } = req.body;
  
    const file = (req as any).file;

    const newMessageData: any = {
      chatRoomId,
      createdAt: Date.now(),
    };
  
    if (file) {
      newMessageData.fileUrl = `/MessageFiles/${file.filename}`;
      newMessageData.fileName = file.originalname;
    }
    if (content) {
      newMessageData.content = content;
    }
  
    if (senderType === "Admin") {
      if (!(req as any).admin) {
        throw new Error("Admin data is missing in the request.");
      }
      newMessageData.sender = (req as any).admin._id;
      newMessageData.senderType = "Admin";
    } else if (senderType === "TheaterOwner") {
      if (!(req as any).theaterOwner) {
        throw new Error("Theater data is missing in the request.");
      }
      newMessageData.sender = (req as any).theaterOwner._id;
      newMessageData.senderType = "TheaterOwner";
    } else {
      throw new Error("Invalid senderType provided.");
    }
  
    const newMessage = await Message.create(newMessageData);
  
    await ChatRoom.findByIdAndUpdate(chatRoomId, {
      lastMessage: content,
      lastMessageTime: Date.now(),
    });
  
    const io = (req.app as any).get("io");

    io.to(chatRoomId).emit("message", newMessage);
  
    res.status(201).json(newMessage);
  });
  

  getUnreadMessages = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    
    const theaterOwnerId = (req as any).theaterOwner._id;

    console.log("getUnreadMessages theaterOwnerId: ", theaterOwnerId);
    
    const chatRooms = await ChatRoom.find({ theaterOwnerId });

    console.log("getUnreadMessages chatRooms: ", chatRooms);

    const chatRoomIds = chatRooms.map((room) => room._id);

    const unreadMessages = await Message.find({
      chatRoomId: { $in: chatRoomIds },
      senderType: 'TheaterOwner',
      read: false,
    });

    res.json(unreadMessages);
  });

  getAdminUnreadMessages = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const theaterOwnerId = (req as any).theaterOwner._id;
    const theaters = await TheaterDetails.find({ theaterOwnerId });
    const theaterIds = theaters.map((theater) => theater._id);

    const chatRooms = await ChatRoom.find({ theaterId: { $in: theaterIds } });
    const chatRoomIds = chatRooms.map((room) => room._id);

    const unreadMessages = await Message.find({
      chatRoomId: { $in: chatRoomIds },
      senderType: 'Admin',
      read: false,
    });

    res.json(unreadMessages);
  });

  markMessagesAsRead = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { chatRoomId } = req.body;

    console.log("theater owner chatRoomId: ", chatRoomId);

    await Message.updateMany(
      { chatRoomId, senderType: { $ne: 'TheaterOwner' }, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({ message: 'Messages marked as read' });
  });

  getAdminChatRooms = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const adminId = req.params.adminId;
    
    const chatRooms = await ChatRoom.find({ adminId }).populate('theaterOwnerId', 'name');

    const chatRoomsWithUnreadCount = await Promise.all(
      chatRooms.map(async (room) => {
        const unreadMessagesCount = await Message.countDocuments({
          chatRoomId: room._id,
          senderType: 'TheaterOwner',
          read: false,
        });
        return {
          ...room.toObject(),
          unreadMessagesCount,
        };
      })
    );

    res.json(chatRoomsWithUnreadCount);
  });

  getAdminMessages = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const messages = await Message.find({ chatRoomId: req.params.chatRoomId }).sort('timestamp');
    res.json(messages);
  });

  sendAdminMessages = expressAsyncHandler(async (req: CustomRequest, res: Response): Promise<void> => {
  
    const { content, senderType, theaterOwnerId } = req.body;
  
    const newMessageData: any = {
      chatRoomId: req.params.chatRoomId,
      createdAt: Date.now(),
      read: false,
    };
  
    if (req.file) {
      newMessageData.fileUrl = `/MessageFiles/${req.file.filename}`;
      newMessageData.fileName = req.file.originalname;
    }
  
    if (content) {
      newMessageData.content = content;
    }
  
    // Determine sender based on senderType
    if (senderType === "Admin") {
      if (!req.admin) {
        throw new Error("Admin data is missing in the request.");
      }
      newMessageData.sender = req.admin._id;
      newMessageData.senderType = "Admin";
    } else if (senderType === "TheaterOwner") {
      if (!theaterOwnerId) {
        throw new Error("TheaterOwner ID is missing in the request.");
      }
      newMessageData.sender = theaterOwnerId;
      newMessageData.senderType = "TheaterOwner";
    } else {
      throw new Error("Invalid senderType provided.");
    }
  
    try {
      const newMessage = await Message.create(newMessageData);
  
      await ChatRoom.findByIdAndUpdate(req.params.chatRoomId, {
        lastMessage: content,
        lastMessageTime: Date.now(),
      });
  
      const io = (req.app as any).get("io");
      io.to(req.params.chatRoomId).emit("message", newMessage);
  
      res.status(201).json(newMessage);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ error: "Failed to create message" });
    }
  });  
  

  markAdminMessagesAsRead = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { chatRoomId } = req.body;

    console.log("admin chatRoomId: ", chatRoomId);

    await Message.updateMany(
      { chatRoomId, senderType: { $ne: 'Admin' }, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({ message: 'Messages marked as read' });
  });
}

export default new ChatRoomController();