import connectDB from "./Config/DB";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import UserRoutes from "./Routes/UserRoutes";
const express = require("express");

dotenv.config();
connectDB();

const port = process.env.PORT || 6000;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.use(cookieParser());
app.use(express.static('Back-End/public'));

app.use("/api/users", UserRoutes)

app.listen(port, () => console.log(`Server Is Running On Port http://localhost:${port}/`));