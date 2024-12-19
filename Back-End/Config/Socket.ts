import { Server, Socket } from "socket.io";
import express from "express";
import http from "http";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket: Socket) => {
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
    // Broadcast to all clients in the room, including sender
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

  socket.on("disconnect", () => {
    console.log("Client Disconnected");
  });
  // --- Notification Sockets ---
  socket.on("joinNotifications", ({ userId }) => {
    socket.join(userId); // Join a user-specific room for notifications
    console.log(`User ${userId} joined their notification room`);
  });

  socket.on("sendNotification", ({ userId, notification }) => {
    io.to(userId).emit("newNotification", { notification });
    console.log(
      `Real-time: Notification sent to user ${userId}: ${notification}`
    );
  });

  socket.on("disconnect", () => {
    console.log("Client Disconnected");
  });
});

export { app, io, server };
