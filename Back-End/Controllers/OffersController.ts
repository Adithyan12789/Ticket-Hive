import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { CustomRequest } from "../Middlewares/TheaterAuthMiddleware";
import OffersService from "../Services/OffersService";

class OffersController {
  addOfferController = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const offerData = req.body;

      try {
        const createdOffer = await OffersService.addOfferService(offerData);
        res.status(201).json({
          message: "Offer created successfully",
          offer: createdOffer,
        });
      } catch (error: any) {
        console.error("Error creating offer:", error);
        res.status(error.statusCode || 500).json({ message: error.message || "Server error" });
      }
    }
  );

  updateOfferController = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { offerId } = req.params;
      const offerData = req.body;

      try {
        const updatedOffer = await OffersService.updateOfferService(offerId, offerData);
        res.status(200).json({
          message: "Offer updated successfully",
          offer: updatedOffer,
        });
      } catch (error: any) {
        console.error("Error updating offer:", error);
        res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
      }
    }
  );

  deleteOfferController = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { offerId } = req.params;

      try {
        const deletedOffer = await OffersService.deleteOfferHandler(offerId);

        if (!deletedOffer) {
          res.status(404).json({ message: "Offer not found for deletion" });
          return;
        }

        res.status(200).json({ message: "Offer deleted successfully", deletedOffer });
      } catch (error: any) {
        console.error("Error deleting offer:", error);
        res.status(500).json({ message: "Error deleting offer", error: error.message });
      }
    }
  );

  getOffersController = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        const offers = await OffersService.getOffersService();
        res.status(200).json(offers);
      } catch (error) {
        console.error("Error fetching offers:", error);
        res.status(500).json({ message: "Server error. Please try again." });
      }
    }
  );
}

export default new OffersController();
