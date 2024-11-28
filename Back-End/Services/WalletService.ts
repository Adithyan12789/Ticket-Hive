import mongoose from "mongoose";
import Wallet, { ITransaction, IWallet } from "../Models/WalletModel";
import { v4 as uuidv4 } from "uuid";
import WalletRepo from "../Repositories/WalletRepo";

class WalletService {
  static async addMoneyToWallet(
    userId: string,
    amount: number,
    description: string
  ) {

    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      await Wallet.create({
        user: userId,
        balance: amount,
        transactions: [
          {
            type: "credit",
            amount,
            description,
            date: new Date(),
            transactionId: uuidv4(),
            status: "success",
          },
        ],
      });
    } else {
      wallet.balance += amount;
      wallet.transactions.push({
        type: "credit",
        amount,
        description,
        date: new Date(),
        transactionId: uuidv4(),
        status: "success",
      });
      await wallet.save();
    }
  }

  static async addCashbackToWallet(
    userId: string,
    amount: number,
    description: string
  ): Promise<void> {
    const wallet = await Wallet.findOne({ user: userId });

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    const transaction: ITransaction = {
      transactionId: uuidv4(), // Unique ID for the transaction
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

  static async getWalletBalance(userId: string): Promise<number> {
    const wallet: IWallet | null = await WalletRepo.findWalletByUserId(userId);
    if (!wallet) throw new Error("Wallet not found");
    return wallet.balance; // Assuming the wallet document has a 'balance' field
  }

  // Deduct the specified amount from the user's wallet
  static async deductAmountFromWallet(userId: string, amount: number, description: string): Promise<void> {
    const wallet: IWallet | null = await WalletRepo.findWalletByUserId(userId);
    if (!wallet) throw new Error("Wallet not found");

    if (wallet.balance < amount) {
      throw new Error("Insufficient funds in wallet");
    }

    wallet.balance -= amount;

    const transaction: ITransaction = {
      transactionId: uuidv4(),
      type: "debit",
      amount,
      status: "success",
      description,
      date: new Date(),
    };

    wallet.transactions.push(transaction);

    await wallet.save();
  }

  static async getTransactionHistory(userId: string) {
    const wallet = await Wallet.findOne({ user: userId });

    if (!wallet) {
      return { balance: 0, transactions: [] }; // Default values
    }

    return { balance: wallet.balance, transactions: wallet.transactions };
  }
}

export default WalletService;
