"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const OffersModel_1 = require("../Models/OffersModel");
const OffersRepo_1 = __importDefault(require("../Repositories/OffersRepo"));
class OffersService {
    async addOfferService(offerData) {
        const { ownerId, offerName, paymentMethod, offerDescription, discountValue, minPurchaseAmount, validityStart, validityEnd, applicableTheaters, } = offerData;
        if (!offerName ||
            !ownerId ||
            !paymentMethod ||
            !offerDescription ||
            !discountValue ||
            minPurchaseAmount === undefined ||
            !validityStart ||
            !validityEnd ||
            !Array.isArray(applicableTheaters) ||
            applicableTheaters.length === 0) {
            throw { statusCode: 400, message: "All fields are required" };
        }
        const parsedValidityStart = new Date(validityStart);
        const parsedValidityEnd = new Date(validityEnd);
        if (isNaN(parsedValidityStart.getTime()) ||
            isNaN(parsedValidityEnd.getTime())) {
            throw { statusCode: 400, message: "Invalid date format" };
        }
        const theaterObjectIds = applicableTheaters.map((id) => new mongoose_1.default.Types.ObjectId(id));
        const newOffer = new OffersModel_1.Offer({
            offerName,
            createdBy: ownerId,
            paymentMethod,
            description: offerDescription,
            discountValue,
            minPurchaseAmount,
            validityStart: parsedValidityStart,
            validityEnd: parsedValidityEnd,
            applicableTheaters: theaterObjectIds,
        });
        const createdOffer = await newOffer.save();
        return createdOffer;
    }
    async updateOfferService(offerId, offerData) {
        const { offerName, paymentMethod, offerDescription, discountValue, minPurchaseAmount, validityStart, validityEnd, applicableTheaters, } = offerData;
        // Validate required fields
        if (!offerName ||
            !paymentMethod ||
            !offerDescription ||
            !discountValue ||
            minPurchaseAmount === undefined ||
            !validityStart ||
            !validityEnd ||
            !Array.isArray(applicableTheaters) ||
            applicableTheaters.length === 0) {
            throw { statusCode: 400, message: "All fields are required" };
        }
        const parsedValidityStart = new Date(validityStart);
        const parsedValidityEnd = new Date(validityEnd);
        if (isNaN(parsedValidityStart.getTime()) ||
            isNaN(parsedValidityEnd.getTime())) {
            throw { statusCode: 400, message: "Invalid date format" };
        }
        const theaterObjectIds = applicableTheaters.map((id) => new mongoose_1.default.Types.ObjectId(id));
        const updatedOffer = await OffersRepo_1.default.updateOffer(offerId, {
            offerName,
            paymentMethod,
            description: offerDescription,
            discountValue,
            minPurchaseAmount,
            validityStart: parsedValidityStart,
            validityEnd: parsedValidityEnd,
            applicableTheaters: theaterObjectIds,
        });
        if (!updatedOffer) {
            throw { statusCode: 404, message: "Offer not found" };
        }
        return updatedOffer;
    }
    async deleteOfferHandler(offerId) {
        const deletedOffer = await OffersModel_1.Offer.findByIdAndDelete(offerId);
        return deletedOffer;
    }
    async getOffersService() {
        const currentDate = new Date();
        await OffersModel_1.Offer.deleteMany({ validUntil: { $lt: currentDate } });
        return OffersModel_1.Offer.find();
    }
}
exports.default = new OffersService();
