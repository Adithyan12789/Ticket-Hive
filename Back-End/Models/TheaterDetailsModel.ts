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
    verificationStatus?: 'pending' | 'accepted' | 'rejected';
    latitude?: number;
    longitude?: number;
    createdAt?: Date;
    updatedAt?: Date;
    movies: mongoose.Types.ObjectId[];
    ticketPrice: number;
}

const theaterDetailsSchema: Schema<ITheaterDetails> = new Schema(
    {
        name: { type: String, required: true },
        city: { type: String, required: true },
        address: { type: String, required: true },
        images: { type: [String], required: true, default: [] },
        showTimes: { type: [String], required: true, default: [] },
        description: { type: String, required: true },
        amenities: { type: [String], required: true },
        removeImages: { type: [String] },
        isListed: { type: Boolean, default: false },
        isVerified: { type: Boolean, default: false },
        theaterOwnerId: { type: Schema.Types.ObjectId, ref: 'TheaterOwner', required: true },
        certificate: { type: String },
        verificationStatus: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending',
        },
        latitude: {
            type: Number,
            min: -90,
            max: 90,
            validate: {
                validator: (value: number) => value >= -90 && value <= 90,
                message: "Latitude must be between -90 and 90 degrees",
            },
        },
        longitude: {
            type: Number,
            min: -180,
            max: 180,
            validate: {
                validator: (value: number) => value >= -180 && value <= 180,
                message: "Longitude must be between -180 and 180 degrees",
            },
        },
        movies: [{ type: Schema.Types.ObjectId, ref: 'Movie', required: true }], // New movies field
        ticketPrice: { type: Number, required: true }, 
    },
    {
        timestamps: true,
    }
);

const TheaterDetails: Model<ITheaterDetails> = mongoose.model<ITheaterDetails>('TheaterDetails', theaterDetailsSchema);

export default TheaterDetails;
