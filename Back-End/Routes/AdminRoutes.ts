import express from 'express';
import AdminController from '../Controllers/AdminController';
import { AdminAuthMiddleware } from '../Middlewares/AdminAuthMiddleware';

const router = express.Router();

router.post('/admin-login', AdminController.adminLogin);
router.post('/get-user', AdminAuthMiddleware.protect, AdminController.getAllUsers);
router.post('/get-theaterOwners', AdminAuthMiddleware.protect, AdminController.getAllTheaterOwners);
router.patch('/block-user', AdminAuthMiddleware.protect, AdminController.blockUserController);
router.patch('/unblock-user', AdminAuthMiddleware.protect, AdminController.unblockUserController);
router.patch('/block-theaterOwner', AdminAuthMiddleware.protect, AdminController.blockTheaterOwnerController);
router.patch('/unblock-theaterOwner', AdminAuthMiddleware.protect, AdminController.unblockTheaterOwnerController);
router.post('/admin-logout', AdminController.adminLogout);

export default router;
