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
  'https://www.tickethive.fun',
  'https://ticket-hive-dusky.vercel.app/',
  'http://localhost:3000'
];

// ✅ 1. Apply CORS Middleware
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// ✅ 2. Explicitly Handle CORS for Preflight Requests

app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin || "";

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.status(204).end(); // ✅ Ends the response properly without returning
  } else {
    next(); // ✅ Calls next() to continue request processing
  }
});


// ✅ 3. Serve Static Files (If Any)
app.use(express.static('Back-End/public'));

// ✅ 4. Define Routes (MUST be after middleware)
app.use("/api/users", UserRoutes);
app.use("/api/admin", AdminRoutes);
app.use("/api/theater", TheaterRoutes);

// ✅ 5. Start Server
server.listen(port, () => console.log(`Server Is Running On Port http://localhost:${port}/`));
