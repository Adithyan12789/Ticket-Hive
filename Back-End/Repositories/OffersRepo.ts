import { IOffer, Offer } from "../Models/OffersModel";

class OffersRepository {

    public async updateOffer(
        offerId: string,
        updates: Partial<IOffer>
      ): Promise<IOffer | null> {
        try {
          const offer = await Offer.findByIdAndUpdate(offerId, updates, {
            new: true,
          });
          if (!offer) {
            throw { statusCode: 404, message: "Offer not found" };
          }
          return offer;
        } catch (error: any) {
          console.error("Error updating the offer:", error);
          throw { statusCode: 500, message: "Internal server error" };
        }
    }      
}

export default new OffersRepository();
