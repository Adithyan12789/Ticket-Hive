"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const DB_1 = __importDefault(require("./Config/DB"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const UserRoutes_1 = __importDefault(require("./Routes/UserRoutes"));
const AdminRoutes_1 = __importDefault(require("./Routes/AdminRoutes"));
const TheaterRoutes_1 = __importDefault(require("./Routes/TheaterRoutes"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const Socket_1 = require("./Config/Socket");
Socket_1.app.set("io", Socket_1.io);
dotenv_1.default.config();
DB_1.default.connectDB();
const port = process.env.PORT || 5000;
Socket_1.app.use((0, cors_1.default)({
    origin: ["http://localhost:3000", "https://ticket-hive-rho.vercel.app/", "https://ticket-hive-a0yhxvn6i-adithyan-narayanans-projects.vercel.app/"],
    credentials: true,
}));
Socket_1.app.use(express_1.default.json());
Socket_1.app.use(express_1.default.urlencoded({ extended: true }));
Socket_1.app.use((0, cookie_parser_1.default)());
Socket_1.app.use(express_1.default.static('Back-End/public'));
Socket_1.app.use("/api/users", UserRoutes_1.default);
Socket_1.app.use("/api/admin", AdminRoutes_1.default);
Socket_1.app.use("/api/theater", TheaterRoutes_1.default);
Socket_1.server.listen(port, () => console.log(`Server Is Running On Port http://localhost:${port}/`));
