"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class TheaterTokenService {
    constructor() {
        const jwtSecret = process.env.JWT_SECRET_THEATER || "metasploit192167";
        if (!jwtSecret) {
            throw new Error('Environment variable JWT_SECRET_THEATER is not defined');
        }
        this.jwtSecret = jwtSecret;
    }
    generateTheaterToken(res, theaterOwnerId, expiresIn = '30d') {
        const token = jsonwebtoken_1.default.sign({ id: theaterOwnerId }, this.jwtSecret, { expiresIn });
        res.cookie('theaterOwnerJwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: this.getMaxAge(expiresIn),
        });
    }
    getMaxAge(expiresIn) {
        const match = expiresIn.match(/^(\d+)([dhms])$/);
        if (!match) {
            throw new Error('Invalid expiresIn format. Use a number followed by "d", "h", "m", or "s".');
        }
        const [, value, unit] = match;
        const numValue = parseInt(value, 10);
        switch (unit) {
            case 'd': return numValue * 24 * 60 * 60 * 1000;
            case 'h': return numValue * 60 * 60 * 1000;
            case 'm': return numValue * 60 * 1000;
            case 's': return numValue * 1000;
            default: throw new Error('Invalid time unit. Use "d", "h", "m", or "s".');
        }
    }
}
exports.default = new TheaterTokenService();
