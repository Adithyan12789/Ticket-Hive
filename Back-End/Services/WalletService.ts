import Wallet from '../Models/WalletModel';
import { v4 as uuidv4 } from 'uuid';

class WalletService {

  // Add money to the wallet (e.g., cashback after ticket booking)
  static async addMoneyToWallet(userId: string, amount: number, description: string) {
    const wallet = await Wallet.findOne({ user: userId });

    if (!wallet) {
      // If wallet doesn't exist, create one
      await Wallet.create({
        user: userId,
        balance: amount,
        transactions: [
          {
            type: 'credit',
            amount,
            description,
            date: new Date(),
          },
        ],
      });
    } else {
      // If wallet exists, update it
      wallet.balance += amount;
      wallet.transactions.push({
        type: 'credit',
        amount,
        description,
        date: new Date(),
        transactionId: uuidv4(), // Assign a unique transaction ID
        status: 'success',
      });
      await wallet.save();
    }
  }

  // Fetch all transactions for the user
  static async getTransactionHistory(userId: string) {
    const wallet = await Wallet.findOne({ user: userId });

    if (!wallet) {
      throw new Error('No wallet found for this user');
    }

    return wallet.transactions;
  }

}

export default WalletService;
