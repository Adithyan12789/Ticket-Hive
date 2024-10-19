// services/UserService.ts
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { findTheaterOwnerByEmail, saveTheaterOwner, findTheaterOwnerByResetToken, updateTheaterOwner } from "../Repositories/TheaterRepo";
import { sendOtpEmail } from "../Utils/EmailUtil";
import Theater from "../Models/TheaterModel";

export const authTheaterOwnerService = async (email: string, password: string) => {
    const theater = await findTheaterOwnerByEmail(email);
    if (theater && (await theater.matchPassword(password))) {
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
    // Check if the user already exists
    const existingTheaterOwner = await Theater.findOne({ 
        email 
    });

    if (existingTheaterOwner) {
        // If the user exists but OTP is not verified, allow them to proceed to OTP verification
        if (!existingTheaterOwner.otpVerified) {
            // You can resend OTP to the user if they exist and haven't verified
            const otp = crypto.randomInt(100000, 999999).toString();
            existingTheaterOwner.otp = otp;
            existingTheaterOwner.otpVerified = false;  // Reset OTP verification to false
            existingTheaterOwner.otpGeneratedAt = new Date();  // Update OTP generation time
            await existingTheaterOwner.save();

            // Send OTP email again
            await sendOtpEmail(existingTheaterOwner.email, otp);

            // Return the user so that the front-end can proceed with OTP modal
            return existingTheaterOwner;
        }

        // If the user exists and has already verified their OTP, throw an error
        throw new Error('Email already exists.');
    }

    // If no existing user, create a new one
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

    const OTP_EXPIRATION_TIME = 5 * 60 * 1000; // 5 minutes

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

    // Generate OTP as a string
    const otp = crypto.randomInt(100000, 999999).toString(); // Convert number to string

    theater.otp = otp; // Now the OTP is a string
    theater.otpExpires = new Date(Date.now() + 1 * 60 * 1000 + 59 * 1000); // OTP expiration time (1 minute 59 seconds)

    try {
        await saveTheaterOwner(theater); // Save user with new OTP
    } catch (err) {
        throw new Error('Failed to save user with new OTP');
    }

    try {
        await sendOtpEmail(theater.email, otp); // Send OTP email
    } catch (err) {
        throw new Error('Failed to send OTP email');
    }

    return theater; // Optionally return user if needed
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
