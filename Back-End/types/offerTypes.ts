export interface OfferData {
    offerName: string;
    createdBy: string;
    paymentMethod: string;
    description: string;
    discountValue: number;
    minPurchaseAmount: number;
    validityStart: string | Date;
    validityEnd: string | Date;
    applicableTheaters: string[];
}
  