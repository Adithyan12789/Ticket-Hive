// controllers/UserController.ts
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { authTheaterOwnerService, registerTheaterOwnerService, verifyTheaterOwnerOtpService, resendTheaterOwnerOtpService, forgotTheaterOwnerPasswordService, resetTheaterOwnerPasswordService, logoutTheaterOwnerService } from "../Services/TheaterService";
import { sendOtpEmail } from "../Utils/EmailUtil";
import expressAsyncHandler from "express-async-handler";
import Theater from "../Models/TheaterModel";
import generateTheaterToken from "../Utils/GenerateTheaterToken";

const authTheaterOwner = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ message: "Email and password are required" });
        return;
    }

    try {
        const theater = await authTheaterOwnerService(email, password);
        res.status(200).json({
            id: theater._id,
            name: theater.name,
            email: theater.email,
        });
    } catch (err: unknown) {
        if (err instanceof Error) {
            if (err.message === "Invalid Email or Password") {
                res.status(401).json({ message: "Invalid email or password" });
            } else {
                res.status(500).json({ message: "An error occurred during authentication" });
            }
        } else {
            res.status(500).json({ message: "An error occurred during authentication" });
        }
    }
});

const googleLoginTheaterOwner = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { googleName: name, googleEmail: email } = req.body;

    if (!email || !name) {
        res.status(400).json({ message: "Google Name and Email are required" });
        return;
    }

    try {
        let theaterOwner = await Theater.findOne({ email });

        if (theaterOwner) {
            generateTheaterToken(res, theaterOwner._id.toString());
            res.status(200).json({
                success: true,
                data: {
                    _id: theaterOwner._id,
                    name: theaterOwner.name,
                    email: theaterOwner.email,
                },
            });
        } else {
            console.log("Creating a new Theater Owner...");
            theaterOwner = await Theater.create({
                name,
                email,
                otp: "",
                phone: "",
                password: "",
            });
            console.log("Theater Owner created:", theaterOwner);

            if (theaterOwner) {
                generateTheaterToken(res, theaterOwner._id.toString());
                res.status(201).json({
                    success: true,
                    data: {
                        _id: theaterOwner._id,
                        name: theaterOwner.name,
                        email: theaterOwner.email,
                    },
                });
            } else {
                res.status(400).json({ message: "Invalid theater Owner data" });
            }
        }
    } catch (error: any) {
        console.error("Error in google Login:", error.message);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});


const registerTheaterOwner = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { name, email, password, phone } = req.body;

    try {
        const theater = await registerTheaterOwnerService(name, email, password, phone);
        
        const otpSent = !theater.otpVerified;

        res.status(201).json({
            id: theater._id.toString(),
            name: theater.name,
            email: theater.email,
            otpSent,
            message: otpSent ? 'Theater Owner registered successfully. OTP sent.' : 'Theater Owner already registered but OTP not verified.',
        });
    } catch (err: unknown) {
        if (err instanceof Error) {
            if (err.message === 'Email already exists.') {
                res.status(400).json({ message: 'Theater Owner with this email already exists' });
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




const verifyTheaterOwnerOTP = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, otp } = req.body;

    try {
        await verifyTheaterOwnerOtpService(email, otp);
        
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



const resendTheaterOwnerOtp = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;

    try {
        await resendTheaterOwnerOtpService(email);
        res.status(200).json({ message: 'OTP resent successfully' });
    } catch (err: unknown) {
        if (err instanceof Error && err.message === 'Theater Owner not found') {
            res.status(404).json({ message: 'Theater Owner with this email not found' });
        } else if (err instanceof Error && err.message === 'Failed to send OTP') {
            res.status(500).json({ message: 'Failed to resend OTP. Please try again' });
        } else {
            res.status(500).json({ message: 'An unexpected error occurred' });
        }
    }
});


const forgotTheaterOwnerPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;

    if (!email) {
        res.status(400).json({ message: 'Email is required' });
        return;
    }

    try {
        const resetToken = await forgotTheaterOwnerPasswordService(email);
        const resetUrl = `http://localhost:3000/theater-reset-password/${resetToken}`;
        const message = `Password reset link: ${resetUrl}`;

        await sendOtpEmail(email, message);
        res.status(200).json({ message: 'Password reset email sent' });
    } catch (err: unknown) {
        if (err instanceof Error && err.message === 'Theater Owner not found') {
            res.status(404).json({ message: 'Theater Owner with this email not found' });
        } else if (err instanceof Error && err.message === 'Failed to send email') {
            res.status(500).json({ message: 'Failed to send reset email. Please try again' });
        } else {
            res.status(500).json({ message: 'An error occurred during password reset request' });
        }
    }
});


const resetTheaterOwnerPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { password } = req.body;
    const resetToken = req.params.token;

    if (!resetToken || !password) {
        res.status(400).json({ message: 'Token and password are required' });
        return;
    }

    try {
        await resetTheaterOwnerPasswordService(resetToken, password);
        res.status(200).json({ message: 'Password reset successfully' });
    } catch (err: unknown) {
        if (err instanceof Error && err.message === 'Invalid or expired token') {
            res.status(400).json({ message: 'Invalid or expired token' });
        } else { 
            res.status(500).json({ message: 'An error occurred during password reset' });
        }
    }
});


const logoutTheaterOwner = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    await logoutTheaterOwnerService();
    res.cookie('theaterOwnerJwt', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        expires: new Date(0),
    });
    res.status(200).json({ message: "Theater Owner Logged out" });
});

export {
    authTheaterOwner,
    googleLoginTheaterOwner,
    registerTheaterOwner, 
    verifyTheaterOwnerOTP,
    resendTheaterOwnerOtp, 
    forgotTheaterOwnerPassword, 
    resetTheaterOwnerPassword, 
    logoutTheaterOwner 
}