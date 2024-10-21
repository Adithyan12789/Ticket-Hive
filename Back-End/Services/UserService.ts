// services/UserService.ts
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { findUserByEmail, saveUser, findUserByResetToken, updateUser } from "../Repositories/UserRepo";
import { sendOtpEmail } from "../Utils/EmailUtil";
import User from "../Models/UserModel";

export const authenticateUser = async (email: string, password: string) => {
    const user = await findUserByEmail(email);

    if (user) {
        if (user.isBlocked) {
            throw new Error("your account is blocked");
        }
        if (await user.matchPassword(password)) {
            return user;
        }
    }
    
    throw new Error("Invalid Email or Password");
};


export const registerUserService = async (
    name: string, 
    email: string, 
    password: string, 
    phone: string
) => {
    const existingUser = await User.findOne({ 
        email 
    });

    if (existingUser) {
        if (!existingUser.otpVerified) {
            const otp = crypto.randomInt(100000, 999999).toString();
            existingUser.otp = otp;
            existingUser.otpVerified = false;
            existingUser.otpGeneratedAt = new Date();
            await existingUser.save();

            await sendOtpEmail(existingUser.email, otp);

            return existingUser;
        }

        throw new Error('Email already exists.');
    }

    const otp = crypto.randomInt(100000, 999999).toString();

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
        name,
        email,
        phone,
        password: hashedPassword,
        otp,
        otpVerified: false,
    });

    await newUser.save(); 

    await sendOtpEmail(newUser.email, otp);

    return newUser;
};


export const verifyOtpService = async (email: string, otp: string) => {
    const user = await findUserByEmail(email);
    if (!user) {
        throw new Error('User not found');
    }

    const OTP_EXPIRATION_TIME = 5 * 60 * 1000;

    if (!user.otpGeneratedAt) {
        throw new Error('OTP generation time is missing');
    }

    const otpGeneratedAt = user.otpGeneratedAt || new Date(0);
    if (new Date().getTime() - otpGeneratedAt.getTime() > OTP_EXPIRATION_TIME) {
        throw new Error('OTP expired');
    }

    if (String(user.otp) === String(otp)) {
        user.otpVerified = true;
        await user.save();
        return true;
    }
    throw new Error('Incorrect OTP');
};


export const resendOtpService = async (email: string) => {
    const user = await findUserByEmail(email);

    if (!user) {
        throw new Error('User not found');
    }

    const otp = crypto.randomInt(100000, 999999).toString();

    user.otp = otp; // Now the OTP is a string
    user.otpExpires = new Date(Date.now() + 1 * 60 * 1000 + 59 * 1000);

    try {
        await saveUser(user);
    } catch (err) {
        throw new Error('Failed to save user with new OTP');
    }

    try {
        await sendOtpEmail(user.email, otp);
    } catch (err) {
        throw new Error('Failed to send OTP email');
    }

    return user;
};


export const forgotPasswordService = async (email: string) => {
    const user = await findUserByEmail(email);
    if (!user) {
        throw new Error('User not found');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000); 
    await user.save();

    return resetToken;
};

export const resetPasswordService = async (resetToken: string, password: string) => {
    const user = await findUserByResetToken(resetToken);
    if (!user) {
        throw new Error('Invalid or expired token');
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return true;
};

export const logoutUserService = () => {
    return true;
};
