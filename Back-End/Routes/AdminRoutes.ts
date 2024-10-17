import express from 'express';
import { adminLogin, getAllUsers, adminLogout } from '../Controllers/AdminController';
const router = express.Router();

router.post('/admin-login', adminLogin);
router.post('/admin-get-user', getAllUsers); 
router.post('/admin-logout', adminLogout);

export default router;
