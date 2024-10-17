// services/UserService.ts
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { findUserByEmail, saveUser, findUserByResetToken, updateUser } from "../Repositories/UserRepo";
import { sendOtpEmail } from "../Utils/EmailUtil";
import User from "../Models/UserModel";

export const authenticateUser = async (email: string, password: string) => {
    const user = await findUserByEmail(email);
    if (user && (await user.matchPassword(password))) {
        return user;
    }
    throw new Error("Invalid Email or Password");
};

export const registerUserService = async (
    name: string, 
    email: string, 
    password: string, 
    phone: string
) => {
    // Check if the user already exists
    const existingUser = await User.findOne({ 
        email 
    });

    if (existingUser) {
        // If the user exists but OTP is not verified, allow them to proceed to OTP verification
        if (!existingUser.otpVerified) {
            // You can resend OTP to the user if they exist and haven't verified
            const otp = crypto.randomInt(100000, 999999).toString();
            existingUser.otp = otp;
            existingUser.otpVerified = false;  // Reset OTP verification to false
            existingUser.otpGeneratedAt = new Date();  // Update OTP generation time
            await existingUser.save();

            // Send OTP email again
            await sendOtpEmail(existingUser.email, otp);

            // Return the user so that the front-end can proceed with OTP modal
            return existingUser;
        }

        // If the user exists and has already verified their OTP, throw an error
        throw new Error('Email already exists.');
    }

    // If no existing user, create a new one
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

    const OTP_EXPIRATION_TIME = 5 * 60 * 1000; // 5 minutes

    // Check if OTP has expired
    if (new Date().getTime() - new Date(user.otpGeneratedAt).getTime() > OTP_EXPIRATION_TIME) {
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

    // Generate OTP as a string
    const otp = crypto.randomInt(100000, 999999).toString(); // Convert number to string

    user.otp = otp; // Now the OTP is a string
    user.otpExpires = new Date(Date.now() + 1 * 60 * 1000 + 59 * 1000); // OTP expiration time (1 minute 59 seconds)

    try {
        await saveUser(user); // Save user with new OTP
    } catch (err) {
        throw new Error('Failed to save user with new OTP');
    }

    try {
        await sendOtpEmail(user.email, otp); // Send OTP email
    } catch (err) {
        throw new Error('Failed to send OTP email');
    }

    return user; // Optionally return user if needed
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
