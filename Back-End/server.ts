import Database from "./Config/DB";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import UserRoutes from "./Routes/UserRoutes";
import AdminRoutes from "./Routes/AdminRoutes";
import TheaterRoutes from "./Routes/TheaterRoutes";
import express from "express";
import cors from "cors"; 
import { app, server, io } from "./Config/Socket";

app.set("io", io);

dotenv.config();
Database.connectDB();

const port = process.env.PORT || 5000;

app.use(cors({
  origin: ["http://localhost:3000/", 'https://www.tickethive.fun/', 'https://ticket-hive-plum.vercel.app/'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(express.static('Back-End/public')); 

app.use("/api/users", UserRoutes);
app.use("/api/admin", AdminRoutes);
app.use("/api/theater", TheaterRoutes);

server.listen(port, () => console.log(`Server Is Running On Port http://localhost:${port}/`));
