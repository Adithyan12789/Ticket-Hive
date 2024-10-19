import express from 'express';
import { authTheaterOwner, registerTheaterOwner, verifyTheaterOwnerOTP, resendTheaterOwnerOtp, logoutTheaterOwner, forgotTheaterOwnerPassword, resetTheaterOwnerPassword } from '../Controllers/TheaterController';

const router = express.Router();

router.post('/theater-login', authTheaterOwner);
router.post('/theater-signup', registerTheaterOwner);
router.post('/theater-verifyotp', verifyTheaterOwnerOTP);
router.post('/theater-resend-otp', resendTheaterOwnerOtp);
router.post('/theater-forgot-password', forgotTheaterOwnerPassword);
router.put('/theater-reset-password/:token', resetTheaterOwnerPassword);
router.post('/theater-logout', logoutTheaterOwner);

export default router;
