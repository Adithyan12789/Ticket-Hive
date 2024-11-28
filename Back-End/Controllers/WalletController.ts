import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import WalletService from "../Services/WalletService";

class WalletController {
  addMoneyToWallet = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {

      const { userId, amount, description } = req.body;
      

      if (!userId || !amount) {
        console.error("Missing required fields: userId or amount");
        res.status(400).json({ message: "User ID and amount are required" });
        return;
      }

      try {
        await WalletService.addMoneyToWallet(
          userId,
          amount,
          description
        );

        res.status(200).json({
          message: "Money added to wallet successfully",
        });
      } catch (err: unknown) {
        console.error("Error adding money to wallet:", err);
        res
          .status(500)
          .json({ message: "An error occurred while adding money to wallet" });
      }
    }
  );

  getTransactionHistory = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      
      const { userId } = req.params;

      if (!userId) {
        res.status(400).json({ message: "User ID is required" });
        return;
      }

      try {
        const transactions = await WalletService.getTransactionHistory(
          userId as string
        );
        res.status(200).json({ transactions });
      } catch (err: unknown) {
        console.error("Error fetching transaction history:", err);
        res
          .status(500)
          .json({
            message: "An error occurred while fetching transaction history",
          });
      }
    }
  );
}

export default new WalletController();
