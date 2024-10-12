import bcrypt from "bcryptjs";
import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import nodemailer from "nodemailer";
import crypto from 'crypto';
import User from "../Models/UserModel"; // Ensure the path is correct
import generateToken from "../Utils/GenerateToken"; // Ensure the path is correct
import dotenv from 'dotenv';
import expressAsyncHandler from "express-async-handler";

dotenv.config();

// Send OTP email utility
const sendOtpEmail = async (email: string, otp: string): Promise<void> => {
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'OTP Verification',
        text: `Your OTP is: ${otp}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('OTP sent successfully to:', email);
    } catch (error) {
        console.error('Error sending OTP email:', error);
        throw new Error('Failed to send OTP email');
    }
};

// Authentication Controller
const authUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ message: "Email and password are required" });
        return;
    }

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        generateToken(res, user._id.toString());
        res.status(200).json({
            id: user._id,
            name: user.name,
            email: user.email,
        });
    } else {
        res.status(400).json({ message: "Invalid Email or Password" });
    }
});

// Registration Controller
const registerUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { name, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        res.status(400).json({ message: 'Email already exists.' });
        return;
    }

    const otp = crypto.randomInt(100000, 999999).toString();

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
        name,
        email,
        phone,
        password: hashedPassword,
        otp,
        otpVerified: false,
    });

    await user.save();

    try {
        await sendOtpEmail(user.email, otp);
    } catch (error) {
        res.status(500).json({ message: 'Failed to send OTP email.' });
        return;
    }

    res.status(201).json({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        otpSent: true,
        message: 'User registered successfully. OTP sent.',
    });
});

// Verify OTP Controller
const verifyOTP = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
    }

    if (String(user.otp) === String(otp)) {
        user.otpVerified = true;
        await user.save();
        res.status(200).json({ message: 'OTP verified successfully' });
    } else {
        res.status(400).json({ message: 'Incorrect OTP' });
    }
});

// Forgot Password Controller
const forgotPasswordController = expressAsyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
        res.status(400).json({ message: 'Email is required' });
        return;
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now

        await user.save();

        const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
        const message = `Password reset link: ${resetUrl}`;

        await sendOtpEmail(user.email, message);
        res.status(200).json({ message: 'Password reset email sent' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to send email' });
    }
});


// Reset Password Controller
const resetPasswordController = expressAsyncHandler(async (req: Request, res: Response) => {
    const { password } = req.body;
    const resetToken = req.params.token;

    if (!resetToken || !password) {
        res.status(400).json({ message: 'Token and password are required' });
        return;
    }

    try {
        const user = await User.findOne({
            resetPasswordToken: resetToken,
            resetPasswordExpires: { $gt: Date.now() }, // Token not expired
        });

        if (!user) {
            res.status(400).json({ message: 'Invalid or expired token' });
            return;
        }

        // Hash the new password and update the user's password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to reset password' });
    }
});


// Logout Controller
const logoutUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    res.cookie('jwt', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        expires: new Date(0),
    });

    res.status(200).json({ message: "User Logged out" });
});

export {
    authUser,
    registerUser,
    verifyOTP,
    logoutUser,
    forgotPasswordController,
    resetPasswordController
};
