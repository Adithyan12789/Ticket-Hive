// routes/UserRoutes.ts
import express from 'express';
import { authUser, registerUser, verifyOTP, logoutUser, forgotPassword, resetPassword } from '../Controllers/UserController';

const router = express.Router();

router.post('/auth', authUser);
router.post('/signup', registerUser);
router.post('/verifyotp', verifyOTP);
router.post('/forgot-password', forgotPassword); // Forgot password route
router.post('/reset-password', resetPassword); // Reset password route
router.post('/logout', logoutUser);

export default router;
