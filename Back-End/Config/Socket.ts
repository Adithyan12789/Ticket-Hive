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

    io.on('connection', (socket: Socket) => {

        socket.on('joinRoom', ({ roomId }) => {
          socket.join(roomId);
        });
    
        socket.on('disconnect', () => {
        });

        socket.on('messageRead', ({ roomId }) => {
          io.to(roomId).emit('messageRead', { roomId });
          console.log("messageReaded");
        });
        
        socket.on('messageUnRead', ({ roomId }) => {
          io.to(roomId).emit('messageUnRead', { roomId });
        });
        
        socket.on('messageUnReadAdmin', ({ roomId }) => {
          io.to(roomId).emit('messageUnReadAdmin', { roomId });
        });
    
        socket.on('typingTheaterOwner', ({ roomId }) => {
          socket.to(roomId).emit('typingTheaterOwner');
        });
    
        socket.on('stopTypingTheaterOwner', ({ roomId }) => {
          socket.to(roomId).emit('stopTypingTheaterOwner');
        });
    
        socket.on('typingAdmin', ({ roomId }) => {
          socket.to(roomId).emit('typingAdmin');
        });
    
        socket.on('stopTypingAdmin', ({ roomId }) => {
          socket.to(roomId).emit('stopTypingAdmin');
        });
      });

export { app, io, server };
