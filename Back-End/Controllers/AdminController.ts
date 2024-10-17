// adminController.ts
import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import adminService from "../Services/AdminService";
import expressAsyncHandler from "express-async-handler";

// Admin Login Controller
const adminLogin = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ message: "Email and password are required" });
        return;
    }

    try {
        const adminData = adminService.adminLoginService(email, password, res);
        res.status(200).json(adminData);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

const getAllUsers = expressAsyncHandler(async (req, res) => {
    const users = await adminService.getAllUsers();
    res.status(200).json(users);
});

// Admin Logout Controller
const adminLogout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = adminService.adminLogoutService(res);
    res.status(200).json(result);
});

export {
    adminLogin,
    getAllUsers,
    adminLogout
};
