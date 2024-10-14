// controllers/theaterOwnerController.ts

import asyncHandler from 'express-async-handler';
import theaterOwnerService from '../Services/TheaterService';
import { Request, Response } from 'express';

// Authentication Controller
const authTheaterOwner = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        const token = await theaterOwnerService.authTheaterOwner(email, password, res);
        res.status(200).json({ token });
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
const registerTheaterOwner = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password, phone } = req.body;
    try {
        const theaterOwner = await theaterOwnerService.registerTheaterOwner(name, email, password, phone);
        res.status(201).json({
            id: theaterOwner._id,
            name: theaterOwner.name,
            email: theaterOwner.email,
            otpSent: true,
            message: 'Theater owner registered successfully. OTP sent.',
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
const verifyTheaterOwnerOTP = asyncHandler(async (req: Request, res: Response) => {
    const { email, otp } = req.body;
    try {
        const theaterOwner = await theaterOwnerService.verifyOtp(email, otp);
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
const forgotTheaterOwnerPasswordController = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    try {
        const response = await theaterOwnerService.forgotPassword(email);
        res.status(200).json(response);
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
const resetTheaterOwnerPasswordController = asyncHandler(async (req: Request, res: Response) => {
    const { password } = req.body;
    const resetToken = req.params.token;
    try {
        const response = await theaterOwnerService.resetPassword(resetToken, password);
        res.status(200).json(response);
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
const logoutTheaterOwner = asyncHandler(async (req: Request, res: Response) => {
    try {
        const response = theaterOwnerService.logoutTheaterOwner();
        res.cookie('theaterOwnerJwt', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            expires: new Date(0),
        });
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ message: 'Error during logout' });
    }
});

export {
    authTheaterOwner,
    registerTheaterOwner,
    verifyTheaterOwnerOTP,
    forgotTheaterOwnerPasswordController,
    resetTheaterOwnerPasswordController,
    logoutTheaterOwner,
};
