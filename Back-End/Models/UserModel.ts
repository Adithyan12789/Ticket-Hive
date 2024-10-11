import mongoose, { Document } from 'mongoose';
import bcrypt from "bcryptjs";

// Define an interface for the User document
export interface IUser extends Document {
    _id: mongoose.Types.ObjectId; 
    name: string;
    email: string;
    password: string;
    profileImageName?: string; // Optional field
    otp: number;
    otpVerified: boolean;
    resetPasswordToken?: string; // Optional reset token field
    resetPasswordExpires?: Date; // Optional reset token expiration field
    matchPassword(password: string): Promise<boolean>; // Ensure Promise<boolean> return type
}

// Define the user schema
const userSchema = new mongoose.Schema<IUser>({
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
    resetPasswordToken: {
        type: String,
    },
    resetPasswordExpires: {
        type: Date,
    },
}, {
    timestamps: true,
});

// Add the matchPassword method to the user schema
userSchema.methods.matchPassword = async function (enteredPassword: string) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Create and export the User model
const User = mongoose.model<IUser>('User', userSchema);
export default User;
