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

const allowedOrigins = [
  'https://www.tickethive.fun',
  'https://ticket-hive-dusky.vercel.app/',
  'http://localhost:3000'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Configure cookie settings for cross-origin
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

app.use(express.static('Back-End/public')); 

app.use("/api/users", UserRoutes);
app.use("/api/admin", AdminRoutes);
app.use("/api/theater", TheaterRoutes);

server.listen(port, () => console.log(`Server Is Running On Port http://localhost:${port}/`));
