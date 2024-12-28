"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = exports.io = exports.app = void 0;
// Previous imports remain the same
const socket_io_1 = require("socket.io");
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const app = (0, express_1.default)();
exports.app = app;
const server = http_1.default.createServer(app);
exports.server = server;
const io = new socket_io_1.Server(server, {
    cors: {
        origin: ["http://localhost:3000", "https://ticket-hive-rho.vercel.app/", "https://ticket-hive-a0yhxvn6i-adithyan-narayanans-projects.vercel.app/"],
        methods: ["GET", "POST"],
    },
});
exports.io = io;
io.on("connection", (socket) => {
    console.log("Client Connected", socket.id);
    socket.on("joinRoom", ({ roomId }) => {
        socket.join(roomId);
        console.log(`user joined room ${roomId}`);
    });
    socket.on("sendMessage", ({ roomId, message }) => {
        io.to(roomId).emit("newMessage", { message });
        console.log(`message sent to room ${roomId}: ${message}`);
    });
    socket.on("messageRead", ({ roomId }) => {
        io.in(roomId).emit("messageRead", { roomId });
        console.log("messageRead emitted to room:", roomId);
    });
    socket.on("messageUnRead", ({ roomId }) => {
        io.to(roomId).emit("messageUnRead", { roomId });
        console.log("messageUnRead");
    });
    socket.on("messageUnReadAdmin", ({ roomId }) => {
        io.to(roomId).emit("messageUnReadAdmin", { roomId });
        console.log("messageUnReadAdmin");
    });
    socket.on("updateUnreadCount", ({ roomId, count }) => {
        io.to(roomId).emit("unreadMessage", { roomId, count });
        console.log(`Unread count updated for room ${roomId}: ${count}`);
    });
    socket.on("resetUnreadCount", ({ roomId }) => {
        io.to(roomId).emit("unreadMessage", { roomId, count: 0 });
        console.log(`Unread count reset for room ${roomId}`);
    });
    socket.on("typingTheaterOwner", ({ roomId }) => {
        socket.to(roomId).emit("typingTheaterOwner");
        console.log("typingTheaterOwner");
    });
    socket.on("stopTypingTheaterOwner", ({ roomId }) => {
        socket.to(roomId).emit("stopTypingTheaterOwner");
        console.log("stopTypingTheaterOwner");
    });
    socket.on("typingAdmin", ({ roomId }) => {
        socket.to(roomId).emit("typingAdmin");
        console.log("typingAdmin");
    });
    socket.on("stopTypingAdmin", ({ roomId }) => {
        socket.to(roomId).emit("stopTypingAdmin");
        console.log("stopTypingAdmin");
    });
    socket.on("joinNotifications", ({ userId }) => {
        socket.join(userId);
        console.log(`User ${userId} joined their notification room`);
    });
    socket.on("sendNotification", ({ userId, notification }) => {
        io.to(userId).emit("newNotification", { notification });
        console.log(`Real-time: Notification sent to user ${userId}: ${notification}`);
    });
    socket.on("disconnect", () => {
        console.log("Client Disconnected");
    });
});
