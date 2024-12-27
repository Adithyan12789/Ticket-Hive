"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const WalletService_1 = __importDefault(require("../Services/WalletService"));
class WalletController {
    constructor() {
        this.addMoneyToWallet = (0, express_async_handler_1.default)(async (req, res) => {
            const { userId, amount, description } = req.body;
            if (!userId || !amount) {
                console.error("Missing required fields: userId or amount");
                res.status(400).json({ message: "User ID and amount are required" });
                return;
            }
            try {
                await WalletService_1.default.addMoneyToWallet(userId, amount, description);
                res.status(200).json({
                    message: "Money added to wallet successfully",
                });
            }
            catch (err) {
                console.error("Error adding money to wallet:", err);
                res
                    .status(500)
                    .json({ message: "An error occurred while adding money to wallet" });
            }
        });
        this.getTransactionHistory = (0, express_async_handler_1.default)(async (req, res) => {
            const { userId } = req.params;
            if (!userId) {
                res.status(400).json({ message: "User ID is required" });
                return;
            }
            try {
                const transactions = await WalletService_1.default.getTransactionHistory(userId);
                res.status(200).json({ transactions });
            }
            catch (err) {
                console.error("Error fetching transaction history:", err);
                res
                    .status(500)
                    .json({
                    message: "An error occurred while fetching transaction history",
                });
            }
        });
    }
}
exports.default = new WalletController();
