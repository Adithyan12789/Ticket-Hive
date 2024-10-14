import mongoose, { Document, Schema, Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs'

// Interface to define the structure of the user document
export interface IUser extends Document {
    _id: ObjectId;
    name: string;
    email: string;
    password: string;
    phone: string;
    otp: string;
    otpVerified: boolean;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    matchPassword: (password: string) => Promise<boolean>;
}

// Define the schema for the User model
const userSchema: Schema<IUser> = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        phone: { type: String, required: true },
        otp: { type: String, required: true },
        otpVerified: { type: Boolean, default: false },
        resetPasswordToken: { type: String },
        resetPasswordExpires: { type: Date },
    },
    { timestamps: true }
);

// Method to match the provided password with the stored password
userSchema.methods.matchPassword = async function (password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
};

// Create and export the User model
const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default User;
