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
const morgan_1 = __importDefault(require("morgan"));
const Socket_1 = require("./Config/Socket");
Socket_1.app.set("io", Socket_1.io);
dotenv_1.default.config();
DB_1.default.connectDB();
const port = process.env.PORT || 5000;
const allowedOrigins = [
    'https://www.tickethive.fun',
    'https://ticket-hive-dusky.vercel.app/',
    'http://localhost:3000'
];
Socket_1.app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: "GET,POST,PATCH,PUT,DELETE,OPTIONS", // Ensure PATCH is included
    allowedHeaders: "Content-Type,Authorization",
}));
Socket_1.app.use(express_1.default.json());
Socket_1.app.use(express_1.default.urlencoded({ extended: true }));
Socket_1.app.use((0, cookie_parser_1.default)());
Socket_1.app.use((0, morgan_1.default)('dev'));
// Configure cookie settings for cross-origin
Socket_1.app.use((req, res, next) => {
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});
Socket_1.app.use(express_1.default.static('Back-End/public'));
Socket_1.app.use("/api/users", UserRoutes_1.default);
Socket_1.app.use("/api/admin", AdminRoutes_1.default);
Socket_1.app.use("/api/theater", TheaterRoutes_1.default);
Socket_1.server.listen(port, () => console.log(`Server Is Running On Port http://localhost:${port}/`));
