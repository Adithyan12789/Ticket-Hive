import express from 'express';
import { adminLogin, blockUserController, unblockUserController, getAllUsers, adminLogout } from '../Controllers/AdminController';
import { protect } from '../Middlewares/AdminAuthMiddleware';
const router = express.Router();

router.post('/admin-login', adminLogin);
router.post('/get-user',protect,getAllUsers) 
router.patch('/block-user',protect,blockUserController) 
router.patch('/unblock-user',protect,unblockUserController)  
router.post('/admin-logout', adminLogout);

export default router;
