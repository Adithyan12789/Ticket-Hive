"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const OffersService_1 = __importDefault(require("../Services/OffersService"));
class OffersController {
    constructor() {
        this.addOfferController = (0, express_async_handler_1.default)(async (req, res) => {
            const offerData = req.body;
            try {
                const createdOffer = await OffersService_1.default.addOfferService(offerData);
                res.status(201).json({
                    message: "Offer created successfully",
                    offer: createdOffer,
                });
            }
            catch (error) {
                console.error("Error creating offer:", error);
                res.status(error.statusCode || 500).json({ message: error.message || "Server error" });
            }
        });
        this.updateOfferController = (0, express_async_handler_1.default)(async (req, res) => {
            const { offerId } = req.params;
            const offerData = req.body;
            try {
                const updatedOffer = await OffersService_1.default.updateOfferService(offerId, offerData);
                res.status(200).json({
                    message: "Offer updated successfully",
                    offer: updatedOffer,
                });
            }
            catch (error) {
                console.error("Error updating offer:", error);
                res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
            }
        });
        this.deleteOfferController = (0, express_async_handler_1.default)(async (req, res) => {
            const { offerId } = req.params;
            try {
                const deletedOffer = await OffersService_1.default.deleteOfferHandler(offerId);
                if (!deletedOffer) {
                    res.status(404).json({ message: "Offer not found for deletion" });
                    return;
                }
                res.status(200).json({ message: "Offer deleted successfully", deletedOffer });
            }
            catch (error) {
                console.error("Error deleting offer:", error);
                res.status(500).json({ message: "Error deleting offer", error: error.message });
            }
        });
        this.getOffersController = (0, express_async_handler_1.default)(async (req, res) => {
            try {
                const offers = await OffersService_1.default.getOffersService();
                res.status(200).json(offers);
            }
            catch (error) {
                console.error("Error fetching offers:", error);
                res.status(500).json({ message: "Server error. Please try again." });
            }
        });
    }
}
exports.default = new OffersController();
