"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const ChatRoomModel_1 = require("../Models/ChatRoomModel");
const MessageModel_1 = require("../Models/MessageModel");
const TheaterDetailsModel_1 = __importDefault(require("../Models/TheaterDetailsModel"));
const Socket_1 = require("../Config/Socket");
class ChatRoomController {
    constructor() {
        this.getChatRooms = (0, express_async_handler_1.default)(async (req, res) => {
            const theaterOwnerId = req.theaterOwner._id;
            console.log("getChatRooms theaterOwnerId: ", theaterOwnerId);
            const chatRooms = await ChatRoomModel_1.ChatRoom.find({ theaterOwnerId }).populate('adminId', 'name');
            console.log("getChatRooms chatRooms: ", chatRooms);
            const chatRoomsWithUnreadCount = await Promise.all(chatRooms.map(async (room) => {
                const unreadMessagesCount = await MessageModel_1.Message.countDocuments({
                    chatRoomId: room._id,
                    senderType: 'Admin',
                    read: false,
                });
                console.log("getChatRooms unreadMessagesCount: ", unreadMessagesCount);
                // Emit the unread count update through socket.io
                Socket_1.io.in(room._id.toString()).emit("unreadMessage", {
                    roomId: room._id,
                    count: unreadMessagesCount
                });
                return {
                    ...room.toObject(),
                    unreadMessagesCount,
                };
            }));
            console.log("getChatRooms chatRoomsWithUnreadCount: ", chatRoomsWithUnreadCount);
            res.json(chatRoomsWithUnreadCount);
        });
        this.createChatRoom = (0, express_async_handler_1.default)(async (req, res) => {
            console.log("llll");
            const { adminId } = req.body;
            const theaterOwnerId = req.theaterOwner._id;
            console.log("body: ", req.body);
            console.log("theaterOwnerId: ", theaterOwnerId);
            let chatRoom = await ChatRoomModel_1.ChatRoom.findOne({ adminId, theaterOwnerId });
            console.log("chatRoom: ", chatRoom);
            if (!chatRoom) {
                chatRoom = await ChatRoomModel_1.ChatRoom.create({ adminId, theaterOwnerId });
                console.log("created chatRoom: ", chatRoom);
            }
            res.status(201).json(chatRoom);
        });
        this.getMessages = (0, express_async_handler_1.default)(async (req, res) => {
            const messages = await MessageModel_1.Message.find({ chatRoomId: req.params.chatRoomId }).sort('timestamp');
            res.json(messages);
        });
        this.sendMessage = (0, express_async_handler_1.default)(async (req, res) => {
            const chatRoomId = req.params.chatRoomId;
            const { content, senderType } = req.body;
            const file = req.file;
            const newMessageData = {
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
                if (!req.admin) {
                    throw new Error("Admin data is missing in the request.");
                }
                newMessageData.sender = req.admin._id;
                newMessageData.senderType = "Admin";
            }
            else if (senderType === "TheaterOwner") {
                if (!req.theaterOwner) {
                    throw new Error("Theater data is missing in the request.");
                }
                newMessageData.sender = req.theaterOwner._id;
                newMessageData.senderType = "TheaterOwner";
            }
            else {
                throw new Error("Invalid senderType provided.");
            }
            const newMessage = await MessageModel_1.Message.create(newMessageData);
            await ChatRoomModel_1.ChatRoom.findByIdAndUpdate(chatRoomId, {
                lastMessage: content,
                lastMessageTime: Date.now(),
            });
            const io = req.app.get("io");
            io.to(chatRoomId).emit("message", newMessage);
            res.status(201).json(newMessage);
        });
        this.getUnreadMessages = (0, express_async_handler_1.default)(async (req, res) => {
            const theaterOwnerId = req.theaterOwner._id;
            console.log("getUnreadMessages theaterOwnerId: ", theaterOwnerId);
            const chatRooms = await ChatRoomModel_1.ChatRoom.find({ theaterOwnerId });
            console.log("getUnreadMessages chatRooms: ", chatRooms);
            const chatRoomIds = chatRooms.map((room) => room._id);
            const unreadMessages = await MessageModel_1.Message.find({
                chatRoomId: { $in: chatRoomIds },
                senderType: 'TheaterOwner',
                read: false,
            });
            res.json(unreadMessages);
        });
        this.getAdminUnreadMessages = (0, express_async_handler_1.default)(async (req, res) => {
            const theaterOwnerId = req.theaterOwner._id;
            const theaters = await TheaterDetailsModel_1.default.find({ theaterOwnerId });
            const theaterIds = theaters.map((theater) => theater._id);
            const chatRooms = await ChatRoomModel_1.ChatRoom.find({ theaterId: { $in: theaterIds } });
            const chatRoomIds = chatRooms.map((room) => room._id);
            const unreadMessages = await MessageModel_1.Message.find({
                chatRoomId: { $in: chatRoomIds },
                senderType: 'Admin',
                read: false,
            });
            res.json(unreadMessages);
        });
        this.markMessagesAsRead = (0, express_async_handler_1.default)(async (req, res) => {
            const { chatRoomId } = req.body;
            console.log("theater owner chatRoomId: ", chatRoomId);
            await MessageModel_1.Message.updateMany({ chatRoomId, senderType: { $ne: 'TheaterOwner' }, read: false }, { $set: { read: true } });
            res.status(200).json({ message: 'Messages marked as read' });
        });
        this.getAdminChatRooms = (0, express_async_handler_1.default)(async (req, res) => {
            const adminId = req.params.adminId;
            console.log("getAdminChatRooms adminId: ", adminId);
            const chatRooms = await ChatRoomModel_1.ChatRoom.find({ adminId }).populate('theaterOwnerId', 'name');
            console.log("getAdminChatRooms chatRooms: ", chatRooms);
            const chatRoomsWithUnreadCount = await Promise.all(chatRooms.map(async (room) => {
                const unreadMessagesCount = await MessageModel_1.Message.countDocuments({
                    chatRoomId: room._id,
                    senderType: 'TheaterOwner',
                    read: false,
                });
                console.log("unreadMessagesCount: ", unreadMessagesCount);
                Socket_1.io.in(room._id.toString()).emit("unreadMessage", {
                    roomId: room._id,
                    count: unreadMessagesCount
                });
                return {
                    ...room.toObject(),
                    unreadMessagesCount,
                };
            }));
            console.log("chatRoomsWithUnreadCount: ", chatRoomsWithUnreadCount);
            res.json(chatRoomsWithUnreadCount);
        });
        this.getAdminMessages = (0, express_async_handler_1.default)(async (req, res) => {
            const messages = await MessageModel_1.Message.find({ chatRoomId: req.params.chatRoomId }).sort('timestamp');
            res.json(messages);
        });
        this.sendAdminMessages = (0, express_async_handler_1.default)(async (req, res) => {
            const { content, senderType, theaterOwnerId } = req.body;
            const newMessageData = {
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
            }
            else if (senderType === "TheaterOwner") {
                if (!theaterOwnerId) {
                    throw new Error("TheaterOwner ID is missing in the request.");
                }
                newMessageData.sender = theaterOwnerId;
                newMessageData.senderType = "TheaterOwner";
            }
            else {
                throw new Error("Invalid senderType provided.");
            }
            try {
                const newMessage = await MessageModel_1.Message.create(newMessageData);
                await ChatRoomModel_1.ChatRoom.findByIdAndUpdate(req.params.chatRoomId, {
                    lastMessage: content,
                    lastMessageTime: Date.now(),
                });
                const io = req.app.get("io");
                io.to(req.params.chatRoomId).emit("message", newMessage);
                res.status(201).json(newMessage);
            }
            catch (error) {
                console.error("Error creating message:", error);
                res.status(500).json({ error: "Failed to create message" });
            }
        });
        this.markAdminMessagesAsRead = (0, express_async_handler_1.default)(async (req, res) => {
            const { chatRoomId } = req.body;
            console.log("admin chatRoomId: ", chatRoomId);
            await MessageModel_1.Message.updateMany({ chatRoomId, senderType: { $ne: 'Admin' }, read: false }, { $set: { read: true } });
            res.status(200).json({ message: 'Messages marked as read' });
        });
    }
}
exports.default = new ChatRoomController();
