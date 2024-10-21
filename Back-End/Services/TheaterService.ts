// services/UserService.ts
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { findTheaterOwnerByEmail, saveTheaterOwner, findTheaterOwnerByResetToken, updateTheaterOwner } from "../Repositories/TheaterRepo";
import { sendOtpEmail } from "../Utils/EmailUtil";
import Theater from "../Models/TheaterModel";

export const authTheaterOwnerService = async (email: string, password: string) => {
    const theater = await findTheaterOwnerByEmail(email);
    
    if (theater && (await theater.matchPassword(password))) {
        if (theater.isBlocked) {
            throw new Error("Your account has been blocked");
        }
        return theater;
    }

    throw new Error("Invalid Email or Password");
};


export const registerTheaterOwnerService = async (
    name: string, 
    email: string, 
    password: string, 
    phone: string
) => {
    const existingTheaterOwner = await Theater.findOne({ 
        email 
    });

    if (existingTheaterOwner) {
        if (!existingTheaterOwner.otpVerified) {
            const otp = crypto.randomInt(100000, 999999).toString();
            existingTheaterOwner.otp = otp;
            existingTheaterOwner.otpVerified = false;
            existingTheaterOwner.otpGeneratedAt = new Date();
            await existingTheaterOwner.save();

            await sendOtpEmail(existingTheaterOwner.email, otp);
            return existingTheaterOwner;
        }

        throw new Error('Email already exists.');
    }

    const otp = crypto.randomInt(100000, 999999).toString();

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newTheaterOwner = new Theater({
        name,
        email,
        phone,
        password: hashedPassword,
        otp,
        otpVerified: false,
    });

    await newTheaterOwner.save(); 

    await sendOtpEmail(newTheaterOwner.email, otp);

    return newTheaterOwner;
};


export const verifyTheaterOwnerOtpService = async (email: string, otp: string) => {
    const theater = await findTheaterOwnerByEmail(email);
    if (!theater) {
        throw new Error('theater owner not found');
    }

    const OTP_EXPIRATION_TIME = 5 * 60 * 1000;

    // Check if OTP has expired
    if (new Date().getTime() - new Date(theater.otpGeneratedAt).getTime() > OTP_EXPIRATION_TIME) {
        throw new Error('OTP expired');
    }

    if (String(theater.otp) === String(otp)) {
        theater.otpVerified = true;
        await theater.save();
        return true;
    }
    throw new Error('Incorrect OTP');
};


export const resendTheaterOwnerOtpService = async (email: string) => {
    const theater = await findTheaterOwnerByEmail(email);

    if (!theater) {
        throw new Error('User not found');
    }

    const otp = crypto.randomInt(100000, 999999).toString();

    theater.otp = otp;
    theater.otpExpires = new Date(Date.now() + 1 * 60 * 1000 + 59 * 1000);

    try {
        await saveTheaterOwner(theater);
    } catch (err) {
        throw new Error('Failed to save user with new OTP');
    }

    try {
        await sendOtpEmail(theater.email, otp);
    } catch (err) {
        throw new Error('Failed to send OTP email');
    }

    return theater;
};




export const forgotTheaterOwnerPasswordService = async (email: string) => {
    const theater = await findTheaterOwnerByEmail(email);
    if (!theater) {
        throw new Error('User not found');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    theater.resetPasswordToken = resetToken;
    theater.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000); 
    await theater.save();

    return resetToken;
};

export const resetTheaterOwnerPasswordService = async (resetToken: string, password: string) => {
    const theater = await findTheaterOwnerByResetToken(resetToken);
    if (!theater) {
        throw new Error('Invalid or expired token');
    }

    const salt = await bcrypt.genSalt(10);
    theater.password = await bcrypt.hash(password, salt);
    theater.resetPasswordToken = undefined;
    theater.resetPasswordExpires = undefined;

    await theater.save();

    return true;
};

export const logoutTheaterOwnerService = () => {
    return true;
};
