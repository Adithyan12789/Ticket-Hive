"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMiddleware = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const GenerateToken_1 = __importDefault(require("../Utils/GenerateToken"));
const UserModel_1 = __importDefault(require("../Models/UserModel"));
const AuthMiddleware = (0, express_async_handler_1.default)(async (req, res, next) => {
    const accessToken = req.cookies?.accessToken;
    const refreshToken = req.cookies?.refreshToken;
    if (accessToken) {
        const decodedAccess = GenerateToken_1.default.verifyAccessToken(accessToken);
        if (decodedAccess) {
            const user = await UserModel_1.default.findById(decodedAccess.userId).select("-password");
            if (!user) {
                res.status(401);
                throw new Error("User not found or no longer exists");
            }
            req.user = {
                _id: user._id.toString(),
                isBlocked: user.isBlocked ?? false,
            };
            return next();
        }
    }
    if (refreshToken) {
        const decodedRefresh = GenerateToken_1.default.verifyRefreshToken(refreshToken);
        if (decodedRefresh) {
            const user = await UserModel_1.default.findById(decodedRefresh.userId);
            if (user) {
                const newAccessToken = GenerateToken_1.default.generateAccessToken(user._id.toString());
                GenerateToken_1.default.setTokenCookies(res, newAccessToken, refreshToken);
                req.user = {
                    _id: user._id.toString(),
                    isBlocked: user.isBlocked ?? false,
                };
                return next();
            }
        }
    }
    res.status(401);
    throw new Error("Not authorized, invalid or expired token");
});
exports.AuthMiddleware = AuthMiddleware;
