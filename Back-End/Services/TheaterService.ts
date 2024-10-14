// services/theaterOwnerService.ts

import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendOtpEmail } from '../Utils/EmailUtil'; // Import utility for sending OTP email
import theaterOwnerRepo from '../Repositories/TheaterRepo';
import generateTheaterToken from '../Utils/GenerateTheaterToken';
import { Response } from 'express'; // Import Response from express

const authTheaterOwner = async (email: string, password: string, res: Response) => {
    const theaterOwner = await theaterOwnerRepo.findTheaterOwnerByEmail(email);
    if (theaterOwner && (await theaterOwner.matchPassword(password))) {
        return generateTheaterToken(res, theaterOwner._id.toString());
    }
    throw new Error("Invalid Email or Password");
};

const registerTheaterOwner = async (name: string, email: string, password: string, phone: string) => {
    const existingTheaterOwner = await theaterOwnerRepo.findTheaterOwnerByEmail(email);
    if (existingTheaterOwner) throw new Error('Email already exists.');

    const otp = crypto.randomInt(100000, 999999).toString();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newTheaterOwner = await theaterOwnerRepo.createTheaterOwner({
        name,
        email,
        phone,
        password: hashedPassword,
        otp,
        otpVerified: false,
    });

    await sendOtpEmail(newTheaterOwner.email, otp);
    return newTheaterOwner;
};

const verifyOtp = async (email: string, otp: string) => {
    const theaterOwner = await theaterOwnerRepo.findTheaterOwnerByEmail(email);
    if (!theaterOwner) throw new Error('Theater owner not found');
    
    if (String(theaterOwner.otp) === String(otp)) {
        theaterOwner.otpVerified = true;
        
        // Convert _id to string before passing it
        await theaterOwnerRepo.updateTheaterOwner(theaterOwner._id.toString(), { otpVerified: true });
        
        return theaterOwner;
    } else {
        throw new Error('Incorrect OTP');
    }
};


const forgotPassword = async (email: string) => {
    const theaterOwner = await theaterOwnerRepo.findTheaterOwnerByEmail(email);
    if (!theaterOwner) throw new Error('Theater owner not found');

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetLink = `http://localhost:3000/theater-reset-password/${resetToken}`;

    theaterOwner.resetPasswordToken = resetToken;
    theaterOwner.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
    await theaterOwner.save();

    await sendOtpEmail(theaterOwner.email, `Password reset link: ${resetLink}`);
    return { message: 'Password reset email sent' };
};

const resetPassword = async (resetToken: string, newPassword: string) => {
    const theaterOwner = await theaterOwnerRepo.findTheaterOwnerByResetToken(resetToken);
    if (!theaterOwner) throw new Error('Invalid or expired token');

    const salt = await bcrypt.genSalt(10);
    theaterOwner.password = await bcrypt.hash(newPassword, salt);
    theaterOwner.resetPasswordToken = undefined;
    theaterOwner.resetPasswordExpires = undefined;

    await theaterOwner.save();
    return { message: 'Password reset successfully' };
};

const logoutTheaterOwner = () => {
    return { message: "Theater owner logged out" };
};

export default {
    authTheaterOwner,
    registerTheaterOwner,
    verifyOtp,
    forgotPassword,
    resetPassword,
    logoutTheaterOwner,
};
