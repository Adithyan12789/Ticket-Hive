import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ITheaterDetails extends Document {
    name: string;
    city: string;
    address: string;
    images: string[];
    showTimes: string[];
    description: string;
    amenities: string[];
    removeImages?: string[];
    isListed?: boolean;
    theaterOwnerId: mongoose.Types.ObjectId;
    certificate?: string;
    isVerified?: boolean;
    verificationStatus?: 'pending' | 'accepted' | 'rejected' | null;
    latitude?: number;
    longitude?: number;
    createdAt?: Date;
    updatedAt?: Date;
}

const theaterDetailsSchema: Schema<ITheaterDetails> = new Schema(
    {
        name: { type: String, required: true },
        city: { type: String, required: true },
        address: { type: String, required: true },
        images: { type: [String], required: true },
        showTimes: { type: [String], required: true },
        description: { type: String, required: true },
        amenities: { type: [String], required: true },
        removeImages: { type: [String] },
        isListed: { type: Boolean, default: false },
        isVerified: { type: Boolean, default: false },
        theaterOwnerId: { type: Schema.Types.ObjectId, ref: 'TheaterOwner', required: true },
        certificate: { type: String },
        verificationStatus: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
        latitude: { type: Number },
        longitude: { type: Number },
    },
    {
        timestamps: true,
    }
);

const TheaterDetails: Model<ITheaterDetails> = mongoose.model<ITheaterDetails>('TheaterDetails', theaterDetailsSchema);

export default TheaterDetails;
