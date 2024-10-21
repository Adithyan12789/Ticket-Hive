import mongoose, { Document, Schema, Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs'

export interface IUser extends Document {
    _id: ObjectId;
    name: string;
    email: string;
    password: string;
    phone?: string;
    otp?: string;
    otpExpires?: Date;
    otpVerified?: boolean;
    otpGeneratedAt?: Date;  
    isBlocked?: boolean;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    matchPassword: (password: string) => Promise<boolean>;
}

const userSchema: Schema<IUser> = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: false },
        phone: { type: String, required: false },
        otp: { type: String, required: false },
        otpVerified: { type: Boolean, default: false },
        otpGeneratedAt: { type: Date, default: Date.now }, 
        isBlocked: {type: Boolean, default: false, },
        resetPasswordToken: { type: String },
        resetPasswordExpires: { type: Date },
    },
    { timestamps: true }
);

userSchema.methods.matchPassword = async function (password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
};

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default User;
