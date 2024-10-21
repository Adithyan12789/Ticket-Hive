import asyncHandler from "express-async-handler";
import { NextFunction, Request, Response } from "express";
import adminService from "../Services/AdminService";
import expressAsyncHandler from "express-async-handler";

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

const blockUserController = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = await adminService.blockUser(req);
        console.log("Blocked User", user);

        if (user) {
            res.status(200).json({ message: 'User blocked successfully', user });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error blocking user:', error);
        res.status(500).json({ message: 'Error blocking user' });
    }
});


const unblockUserController = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = await adminService.unblockUser(req);
        console.log("Unblocked User", user);

        if (user) {
            res.status(200).json({ message: 'User unblocked successfully', user });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error unblocking user:', error);
        res.status(500).json({ message: 'Error unblocking user' });
    }
});


const adminLogout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = adminService.adminLogoutService(res);
    res.status(200).json(result);
});

export {
    adminLogin,
    getAllUsers,
    blockUserController,
    unblockUserController,
    adminLogout
};
