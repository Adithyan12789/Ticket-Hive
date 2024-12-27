"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const WalletModel_1 = __importDefault(require("../Models/WalletModel"));
const uuid_1 = require("uuid");
const WalletRepo_1 = __importDefault(require("../Repositories/WalletRepo"));
class WalletService {
    static async addMoneyToWallet(userId, amount, description) {
        const wallet = await WalletModel_1.default.findOne({ user: userId });
        if (!wallet) {
            await WalletModel_1.default.create({
                user: userId,
                balance: amount,
                transactions: [
                    {
                        type: "credit",
                        amount,
                        description,
                        date: new Date(),
                        transactionId: (0, uuid_1.v4)(),
                        status: "success",
                    },
                ],
            });
        }
        else {
            wallet.balance += amount;
            wallet.transactions.push({
                type: "credit",
                amount,
                description,
                date: new Date(),
                transactionId: (0, uuid_1.v4)(),
                status: "success",
            });
            await wallet.save();
        }
    }
    static async addCashbackToWallet(userId, amount, description) {
        const wallet = await WalletModel_1.default.findOne({ user: userId });
        if (!wallet) {
            throw new Error("Wallet not found");
        }
        const transaction = {
            transactionId: (0, uuid_1.v4)(), // Unique ID for the transaction
            amount,
            type: "credit",
            status: "success",
            date: new Date(),
            description,
        };
        wallet.transactions.push(transaction);
        wallet.balance += amount;
        await wallet.save();
    }
    static async getWalletBalance(userId) {
        const wallet = await WalletRepo_1.default.findWalletByUserId(userId);
        if (!wallet)
            throw new Error("Wallet not found");
        return wallet.balance; // Assuming the wallet document has a 'balance' field
    }
    // Deduct the specified amount from the user's wallet
    static async deductAmountFromWallet(userId, amount, description) {
        const wallet = await WalletRepo_1.default.findWalletByUserId(userId);
        if (!wallet)
            throw new Error("Wallet not found");
        if (wallet.balance < amount) {
            throw new Error("Insufficient funds in wallet");
        }
        wallet.balance -= amount;
        const transaction = {
            transactionId: (0, uuid_1.v4)(),
            type: "debit",
            amount,
            status: "success",
            description,
            date: new Date(),
        };
        wallet.transactions.push(transaction);
        await wallet.save();
    }
    static async getTransactionHistory(userId) {
        const wallet = await WalletModel_1.default.findOne({ user: userId });
        if (!wallet) {
            return { balance: 0, transactions: [] }; // Default values
        }
        return { balance: wallet.balance, transactions: wallet.transactions };
    }
}
exports.default = WalletService;
