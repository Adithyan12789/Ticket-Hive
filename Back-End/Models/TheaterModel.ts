import mongoose, { Document } from 'mongoose';
import bcrypt from "bcryptjs";

export interface ITheater extends Document {
    _id: mongoose.Types.ObjectId; 
    name: string;
    email: string;
    password: string;
    profileImageName?: string;
    otp: number;
    otpVerified: boolean;
    favoriteGenres?: string[];
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    matchPassword(password: string): Promise<boolean>;
}

const theaterSchema = new mongoose.Schema<ITheater>({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    profileImageName: {
        type: String,
    },
    otp: {
        type: Number,
    },
    otpVerified: {
        type: Boolean,
        default: false,
    },
    favoriteGenres: {
        type: [String],
    },
    resetPasswordToken: {
        type: String,
    },
    resetPasswordExpires: {
        type: Date,
    },
}, {
    timestamps: true,
});

theaterSchema.methods.matchPassword = async function (enteredPassword: string) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const Theater = mongoose.model<ITheater>('Theater', theaterSchema);
export default Theater;
