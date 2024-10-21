import express from 'express';
import { authUser, googleLogin, registerUser, verifyOTP, resendOtp, logoutUser, forgotPasswordController, resetPasswordController } from '../Controllers/UserController';

const router = express.Router();

router.post('/auth', authUser);
router.post('/googleLogin',googleLogin)
router.post('/signup', registerUser);
router.post('/verifyotp', verifyOTP);
router.post('/resend-otp', resendOtp);
router.post('/forgot-password', forgotPasswordController);
router.put('/reset-password/:token', resetPasswordController);
router.post('/logout', logoutUser);

export default router;
