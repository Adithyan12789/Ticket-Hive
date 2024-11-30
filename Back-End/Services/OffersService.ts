import mongoose from "mongoose";
import { IOffer, Offer } from "../Models/OffersModel";
import OffersRepo from "../Repositories/OffersRepo";

export interface OfferData {
  offerName: string;
  ownerId: string;
  paymentMethod: string;
  offerDescription: string;
  discountValue: number;
  minPurchaseAmount: number;
  validityStart: string | Date;
  validityEnd: string | Date;
  applicableTheaters: string[];
}

class OffersService {
  public async addOfferService(offerData: OfferData): Promise<IOffer> {
    const {
      ownerId,
      offerName,
      paymentMethod,
      offerDescription,
      discountValue,
      minPurchaseAmount,
      validityStart,
      validityEnd,
      applicableTheaters,
    } = offerData;

    if (
      !offerName ||
      !ownerId ||
      !paymentMethod ||
      !offerDescription ||
      !discountValue ||
      minPurchaseAmount === undefined ||
      !validityStart ||
      !validityEnd ||
      !Array.isArray(applicableTheaters) ||
      applicableTheaters.length === 0
    ) {
      throw { statusCode: 400, message: "All fields are required" };
    }

    const parsedValidityStart = new Date(validityStart);
    const parsedValidityEnd = new Date(validityEnd);

    if (
      isNaN(parsedValidityStart.getTime()) ||
      isNaN(parsedValidityEnd.getTime())
    ) {
      throw { statusCode: 400, message: "Invalid date format" };
    }

    const theaterObjectIds = applicableTheaters.map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    const newOffer = new Offer({
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

  public async updateOfferService(offerId: string, offerData: OfferData): Promise<IOffer> {
    const {
      offerName,
      paymentMethod,
      offerDescription,
      discountValue,
      minPurchaseAmount,
      validityStart,
      validityEnd,
      applicableTheaters,
    } = offerData;

    // Validate required fields
    if (
      !offerName ||
      !paymentMethod ||
      !offerDescription ||
      !discountValue ||
      minPurchaseAmount === undefined ||
      !validityStart ||
      !validityEnd ||
      !Array.isArray(applicableTheaters) ||
      applicableTheaters.length === 0
    ) {
      throw { statusCode: 400, message: "All fields are required" };
    }

    const parsedValidityStart = new Date(validityStart);
    const parsedValidityEnd = new Date(validityEnd);

    if (
      isNaN(parsedValidityStart.getTime()) ||
      isNaN(parsedValidityEnd.getTime())
    ) {
      throw { statusCode: 400, message: "Invalid date format" };
    }

    const theaterObjectIds = applicableTheaters.map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    const updatedOffer = await OffersRepo.updateOffer(offerId, {
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

  public async deleteOfferHandler(offerId: string): Promise<IOffer | null> {
    const deletedOffer = await Offer.findByIdAndDelete(offerId);
    return deletedOffer;
  }

  public async getOffersService(): Promise<IOffer[]> {
    return Offer.find();
  }
}

export default new OffersService();
