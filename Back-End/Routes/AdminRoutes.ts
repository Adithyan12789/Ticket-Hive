import express from 'express';
import { adminLogin, blockUserController, unblockUserController, blockTheaterOwnerController, unblockTheaterOwnerController, getAllUsers, getAllTheaterOwners,  adminLogout } from '../Controllers/AdminController';
import { protect } from '../Middlewares/AdminAuthMiddleware';
const router = express.Router();

router.post('/admin-login', adminLogin);
router.post('/get-user',protect,getAllUsers) 
router.post('/get-theaterOwners',protect,getAllTheaterOwners) 
router.patch('/block-user',protect,blockUserController) 
router.patch('/unblock-user',protect,unblockUserController)  
router.patch('/block-theaterOwner',protect,blockTheaterOwnerController) 
router.patch('/unblock-theaterOwner',protect,unblockTheaterOwnerController)  
router.post('/admin-logout', adminLogout);

export default router;
