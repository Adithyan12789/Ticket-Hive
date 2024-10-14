import express from 'express';
import { authTheaterOwner, registerTheaterOwner, verifyTheaterOwnerOTP, logoutTheaterOwner, forgotTheaterOwnerPasswordController, resetTheaterOwnerPasswordController } from '../Controllers/TheaterController';

const router = express.Router();

router.post('/theater-login', authTheaterOwner);
router.post('/theater-signup', registerTheaterOwner);
router.post('/theater-verifyotp', verifyTheaterOwnerOTP);
router.post('/theater-forgot-password', forgotTheaterOwnerPasswordController);
router.put('/theater-reset-password/:token', resetTheaterOwnerPasswordController);
router.post('/theater-logout', logoutTheaterOwner);

export default router;
