import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import WalletService from '../Services/WalletService';

class WalletController {

  addMoneyToWallet = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { userId, amount } = req.body;

      if (!userId || !amount) {
        res.status(400).json({ message: 'User ID and amount are required' });
        return;
      }

      try {
        const cashbackDescription = 'Cashback after booking a ticket'; // Customize this message
        await WalletService.addMoneyToWallet(userId, amount, cashbackDescription);

        res.status(200).json({
          message: 'Money added to wallet successfully',
        });
      } catch (err: unknown) {
        res.status(500).json({ message: 'An error occurred while adding money to wallet' });
      }
    }
  );

  // Get all transaction history for the user
  getTransactionHistory = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { userId } = req.body;

      if (!userId) {
        res.status(400).json({ message: 'User ID is required' });
        return;
      }

      try {
        const transactions = await WalletService.getTransactionHistory(userId);
        res.status(200).json({ transactions });
      } catch (err: unknown) {
        res.status(500).json({ message: 'An error occurred while fetching transaction history' });
      }
    }
  );

}

export default new WalletController();
