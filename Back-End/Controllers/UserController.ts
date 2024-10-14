// controllers/UserController.ts
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { authenticateUser, registerUserService, verifyOtpService, forgotPasswordService, resetPasswordService, logoutUserService } from "../Services/UserService";
import { sendOtpEmail } from "../Utils/EmailUtil";

// Authentication Controller
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
        if (typeof err === 'object' && err !== null && 'data' in err) {
            const error = err as { data?: { message?: string } };
            res.status(400).json({ message: error.data?.message || 'An error occurred' });
        } else {
            res.status(400).json({ message: 'An error occurred' });
        }
    }
});

// Registration Controller
const registerUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { name, email, password, phone } = req.body;

    try {
        const user = await registerUserService(name, email, password, phone);
        res.status(201).json({
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            otpSent: true,
            message: 'User registered successfully. OTP sent.',
        });
    } catch (err: unknown) {
        if (typeof err === 'object' && err !== null && 'data' in err) {
            const error = err as { data?: { message?: string } };
            res.status(400).json({ message: error.data?.message || 'An error occurred' });
        } else {
            res.status(400).json({ message: 'An error occurred' });
        }
    }
});

// Verify OTP Controller
const verifyOTP = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, otp } = req.body;

    try {
        await verifyOtpService(email, otp);
        res.status(200).json({ message: 'OTP verified successfully' });
    } catch (err: unknown) {
        if (typeof err === 'object' && err !== null && 'data' in err) {
            const error = err as { data?: { message?: string } };
            res.status(400).json({ message: error.data?.message || 'An error occurred' });
        } else {
            res.status(400).json({ message: 'An error occurred' });
        }
    }
});

// Forgot Password Controller
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
        if (typeof err === 'object' && err !== null && 'data' in err) {
            const error = err as { data?: { message?: string } };
            res.status(400).json({ message: error.data?.message || 'An error occurred' });
        } else {
            res.status(400).json({ message: 'An error occurred' });
        }
    }
});

// Reset Password Controller
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
        if (typeof err === 'object' && err !== null && 'data' in err) {
            const error = err as { data?: { message?: string } };
            res.status(400).json({ message: error.data?.message || 'An error occurred' });
        } else {
            res.status(400).json({ message: 'An error occurred' });
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
    logoutUser,
    forgotPasswordController,
    resetPasswordController
};
