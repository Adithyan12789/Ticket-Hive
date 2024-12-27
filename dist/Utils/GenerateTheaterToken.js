"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class TheaterTokenService {
    constructor() {
        if (!process.env.JWT_SECRET_THEATER) {
            throw new Error('JWT_SECRET_THEATER is not defined');
        }
        this.jwtSecret = process.env.JWT_SECRET_THEATER || 'metasploit192167';
    }
    generateTheaterToken(res, theaterOwnerId) {
        const token = jsonwebtoken_1.default.sign({ id: theaterOwnerId }, this.jwtSecret, { expiresIn: '30d' });
        res.cookie('theaterOwnerJwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });
    }
}
exports.default = new TheaterTokenService();
