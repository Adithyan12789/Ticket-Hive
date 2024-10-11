// server/src/controllers/UserController.ts
import bcrypt from "bcryptjs";
import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import nodemailer from "nodemailer"; 
import crypto from 'crypto';
import User from "../Models/UserModel"; // Ensure the path is correct
import generateToken from "../Utils/GenerateToken"; // Ensure the path is correct
import dotenv from 'dotenv';

dotenv.config();

// Send OTP email
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

    // Check if email and password are provided
    if (!email || !password) {
        res.status(400).json({ message: "Email and password are required" });
        return;
    }

    // Find the user by email
    const user = await User.findOne({ email });

    console.log("User found:", user); // Log the found user for debugging

    // If user exists and passwords match
    if (user) {
        const isPasswordValid = await user.matchPassword(password);
        console.log("Password valid:", isPasswordValid); // Log if the password is valid

        if (isPasswordValid) {
            generateToken(res, user._id.toString()); // Generate token
            res.status(200).json({
                id: user._id,
                name: user.name,
                email: user.email,
            });
        } else {
            // Password is incorrect
            res.status(400).json({ message: "Invalid Email or Password" });
        }
    } else {
        // User not found
        res.status(400).json({ message: "Invalid Email or Password" });
    }
});


// Registration Controller
const registerUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { name, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        res.status(400).json({ message: 'Email already exists. Please use a different email.' });
        return;
    }

    // Generate a new OTP for the new user
    const otp = crypto.randomInt(100000, 999999).toString();

    // Create the new user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt); // Hash the password

    const user = new User({
        name,
        email,
        phone,
        password: hashedPassword, // Store the hashed password
        otp,
        otpVerified: false,
    });

    await user.save(); // Save the user to the database

    // Send OTP email to the newly registered user
    try {
        await sendOtpEmail(user.email, otp);
    } catch (error) {
        res.status(500).json({ message: 'Failed to send OTP email. Please try again.' });
        return;
    }

    res.status(201).json({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        otpSent: true,
        message: 'User registered successfully. OTP has been sent to your email.',
    });
});

// Verify OTP Controller
const verifyOTP = asyncHandler(async (req: Request, res: Response): Promise<void> => { 
    const { email, otp } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        console.log('Stored OTP:', user.otp);
        console.log('Provided OTP:', otp);

        if (String(user.otp) === String(otp)) { // Ensure matching types
            user.otpVerified = true; // Set user as verified
            await user.save(); // Save user changes

            res.status(200).json({ message: 'OTP verified successfully', otpVerified: user.otpVerified });
        } else {
            res.status(400).json({ message: 'Incorrect OTP. Please try again.', email });
        }
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});


// Forgot Password Controller
const forgotPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;

    // Check if email is provided
    if (!email) {
        res.status(400).json({ message: "Email is required" });
        return;
    }

    try {
        // Find the user by email
        const user = await User.findOne({ email });

        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        // Generate a reset token and set expiration (e.g., 1 hour)
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        const expirationTime = Date.now() + 3600000; // Token valid for 1 hour
        user.resetPasswordExpires = new Date(expirationTime); // Store as a Date

        // Save user with the token and expiration
        await user.save();

        // Initialize transporter inside the function
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Send reset link via email
        const resetUrl = `http://reset-password/${resetToken}`;
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset',
            text: `You requested a password reset. Click the link to reset your password: ${resetUrl}`,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Password reset link sent to your email' });
    } catch (error) {
        res.status(500).json({ message: 'Error sending reset email. Please try again.' });
        console.error('Error in forgotPassword:', error);
    }
});


// Reset Password Controller
const resetPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { token } = req.params; // Get token from the URL
    const { password } = req.body; // Get new password from the request body

    try {
        // Find the user based on the reset token and ensure the token hasn't expired
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }, // Token expiration check
        });

        if (!user) {
            res.status(400).json({ message: "Invalid or expired reset token" });
            return;
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Set the new password and clear the reset token fields
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        // Save the updated user with the new password
        await user.save();

        res.status(200).json({ message: "Password has been reset successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error. Please try again later." });
        console.error("Error in resetPassword:", error);
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
    forgotPassword,
    resetPassword
};
