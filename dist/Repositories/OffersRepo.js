"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const OffersModel_1 = require("../Models/OffersModel");
class OffersRepository {
    async updateOffer(offerId, updates) {
        try {
            const offer = await OffersModel_1.Offer.findByIdAndUpdate(offerId, updates, {
                new: true,
            });
            if (!offer) {
                throw { statusCode: 404, message: "Offer not found" };
            }
            return offer;
        }
        catch (error) {
            console.error("Error updating the offer:", error);
            throw { statusCode: 500, message: "Internal server error" };
        }
    }
}
exports.default = new OffersRepository();
