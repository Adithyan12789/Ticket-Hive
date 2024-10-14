// services/UserService.ts
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { findUserByEmail, saveUser, findUserByResetToken, updateUser } from "../Repositories/UserRepo";
import { sendOtpEmail } from "../Utils/EmailUtil";  // Keeping the email utility here
import User from "../Models/UserModel";

// Service to authenticate user
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
    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new Error('Email already exists.');
    }

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const newUser = new User({
        name,
        email,
        phone,
        password: hashedPassword,
        otp,
        otpVerified: false,
    });

    // Save the new user
    await newUser.save();  // Save the user using the `.save()` method

    // Send OTP email
    await sendOtpEmail(newUser.email, otp);

    return newUser; // Return the saved user object
};

// Service to verify OTP
export const verifyOtpService = async (email: string, otp: string) => {
    const user = await findUserByEmail(email);
    if (!user) {
        throw new Error('User not found');
    }

    if (String(user.otp) === String(otp)) {
        user.otpVerified = true;
        await user.save();
        return true;
    }
    throw new Error('Incorrect OTP');
};

// Service for forgot password
export const forgotPasswordService = async (email: string) => {
    const user = await findUserByEmail(email);
    if (!user) {
        throw new Error('User not found');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now

    await user.save();

    return resetToken;
};

// Service for resetting the password
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

// Service to logout a user
export const logoutUserService = () => {
    // Logic for logging out a user if needed (optional, typically handled by cookies)
    return true;
};
