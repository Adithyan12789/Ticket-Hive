import Database from "./Config/DB";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import UserRoutes from "./Routes/UserRoutes";
import AdminRoutes from "./Routes/AdminRoutes";
import TheaterRoutes from "./Routes/TheaterRoutes";
import express from "express";
import cors from "cors"; 
import morgan from "morgan"; 
import { app, server, io } from "./Config/Socket";
import { Request, Response, NextFunction } from "express";

app.set("io", io);

dotenv.config();
Database.connectDB();

const port = process.env.PORT || 5000;

const allowedOrigins = [
  "https://www.tickethive.fun",
  "https://ticket-hive-dusky.vercel.app/",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin || "";

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    res.status(204).end();
  } else {
    next();
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

app.use(express.static('Back-End/public'));

app.use("/api/users", UserRoutes);
app.use("/api/admin", AdminRoutes);
app.use("/api/theater", TheaterRoutes);

server.listen(port, () => console.log(`Server Is Running On Port http://localhost:${port}/`));
