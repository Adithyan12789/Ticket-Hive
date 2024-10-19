import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface ITheater extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    password: string;
    profileImageName?: string;
    otp: string;
    otpExpires: Date;
    otpVerified: boolean;
    otpGeneratedAt: Date;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    favoriteGenres?: string[];
    matchPassword(password: string): Promise<boolean>;
}

const theaterSchema: Schema<ITheater> = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        profileImageName: { type: String },
        otp: { type: String, required: true },
        otpVerified: { type: Boolean, default: false },
        otpGeneratedAt: { type: Date, default: Date.now },
        resetPasswordToken: { type: String },
        resetPasswordExpires: { type: Date },
        favoriteGenres: { type: [String] },
    }, {
        timestamps: true,
    }
)


// Method to match entered password with hashed password
theaterSchema.methods.matchPassword = async function (password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
};

const Theater: Model<ITheater> = mongoose.model<ITheater>('Theater', theaterSchema);

export default Theater;
