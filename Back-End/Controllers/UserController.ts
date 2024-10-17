// controllers/UserController.ts
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { authenticateUser, registerUserService, verifyOtpService, resendOtpService, forgotPasswordService, resetPasswordService, logoutUserService } from "../Services/UserService";
import { sendOtpEmail } from "../Utils/EmailUtil";
import expressAsyncHandler from "express-async-handler";

const authUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ message: "Email and password are required" });
        return;
    }

    try {
        const user = await authenticateUser(email, password);
        res.status(200).json({
            id: user._id,
            name: user.name,
            email: user.email,
        });
    } catch (err: unknown) {
        if (err instanceof Error) {
            if (err.message === "Invalid Email or Password") {
                // Return the specific error message for invalid email or password
                res.status(401).json({ message: "Invalid email or password" });
            } else {
                // General error handling for other cases
                res.status(500).json({ message: "An error occurred during authentication" });
            }
        } else {
            // Fallback if the error is not an instance of Error
            res.status(500).json({ message: "An error occurred during authentication" });
        }
    }
});


const registerUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { name, email, password, phone } = req.body;

    try {
        const user = await registerUserService(name, email, password, phone);
        
        // Check if the user is newly created or if OTP was sent again for an existing user
        const otpSent = !user.otpVerified; // OTP is sent only if the user hasn't verified their OTP

        res.status(201).json({
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            otpSent,
            message: otpSent ? 'User registered successfully. OTP sent.' : 'User already registered but OTP not verified.',
        });
    } catch (err: unknown) {
        if (err instanceof Error) {
            if (err.message === 'Email already exists.') {
                res.status(400).json({ message: 'User with this email already exists' });
            } else if (err.message === 'Email exists but OTP is not verified.') {
                res.status(400).json({ message: 'Email exists but OTP is not verified.' });
            } else {
                res.status(500).json({ message: 'An error occurred during registration' });
            }
        } else {
            res.status(500).json({ message: 'An unexpected error occurred' });
        }
    }
});




const verifyOTP = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, otp } = req.body;

    try {
        await verifyOtpService(email, otp);
        
        res.status(200).json({ message: 'OTP verified successfully' });
    } catch (err: unknown) {
        if (err instanceof Error && err.message === 'Incorrect OTP') {
            res.status(400).json({ message: 'Incorrect OTP' });
        } else if (err instanceof Error && err.message === 'OTP expired') {
            res.status(400).json({ message: 'OTP has expired. Please request a new one' });
        } else {
            res.status(500).json({ message: 'An error occurred during OTP verification' });
        }
    }
});



const resendOtp = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;

    try {
        await resendOtpService(email);
        res.status(200).json({ message: 'OTP resent successfully' });
    } catch (err: unknown) {
        if (err instanceof Error && err.message === 'User not found') {
            res.status(404).json({ message: 'User with this email not found' });
        } else if (err instanceof Error && err.message === 'Failed to send OTP') {
            res.status(500).json({ message: 'Failed to resend OTP. Please try again' });
        } else {
            res.status(500).json({ message: 'An unexpected error occurred' });
        }
    }
});


const forgotPasswordController = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;

    if (!email) {
        res.status(400).json({ message: 'Email is required' });
        return;
    }

    try {
        const resetToken = await forgotPasswordService(email);
        const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
        const message = `Password reset link: ${resetUrl}`;

        await sendOtpEmail(email, message);
        res.status(200).json({ message: 'Password reset email sent' });
    } catch (err: unknown) {
        if (err instanceof Error && err.message === 'User not found') {
            res.status(404).json({ message: 'User with this email not found' });
        } else if (err instanceof Error && err.message === 'Failed to send email') {
            res.status(500).json({ message: 'Failed to send reset email. Please try again' });
        } else {
            res.status(500).json({ message: 'An error occurred during password reset request' });
        }
    }
});


const resetPasswordController = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { password } = req.body;
    const resetToken = req.params.token;

    if (!resetToken || !password) {
        res.status(400).json({ message: 'Token and password are required' });
        return;
    }

    try {
        await resetPasswordService(resetToken, password);
        res.status(200).json({ message: 'Password reset successfully' });
    } catch (err: unknown) {
        if (err instanceof Error && err.message === 'Invalid or expired token') {
            res.status(400).json({ message: 'Invalid or expired token' });
        } else { 
            res.status(500).json({ message: 'An error occurred during password reset' });
        }
    }
});


// Logout Controller
const logoutUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    await logoutUserService();
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
    resendOtp,
    logoutUser,
    forgotPasswordController,
    resetPasswordController
};
