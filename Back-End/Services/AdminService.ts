// adminService.ts
import mongoose from "mongoose";
import adminRepository from "../Repositories/AdminRepo";
import generateAdminToken from '../Utils/GenerateAdminToken';
import { Request, Response } from 'express';

const adminLoginService = (email: string, password: string, res: Response) => {
    const { adminEmail, adminPassword } = adminRepository.getAdminCredentials();

    if (email === adminEmail && password === adminPassword) {
        const token = generateAdminToken(res, "admin");
        return {
            id: "admin",
            name: "Admin User",
            email: adminEmail,
            token: token,
            isAdmin: true
        };
    }

    throw new Error("Invalid Admin Email or Password");
};

const getAllUsers = async () => {
    return await adminRepository.getAllUsers();
};

const blockUser = async (req: Request): Promise<any> => {
    const userId = req.body.userId;
    console.log("User Id: ", userId);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid userId format');
    }

    try {
        console.log(`Updating user with ID: ${userId}`);
        const updatedUser = await adminRepository.updateUser(userId, { isBlocked: true });

        return updatedUser;
    } catch (error) {
        console.error(`Error updating user: ${error}`);
        throw new Error('Error updating user');
    }
};


const unblockUser = async (req: Request): Promise<any> => {
    const userId = req.body.userId;
    console.log("User Id: ", userId);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid userId format');
    }

    try {
        console.log(`Updating user with ID: ${userId}`);
        const updatedUser = await adminRepository.updateUser(userId, { isBlocked: false });

        return updatedUser;
    } catch (error) {
        console.error(`Error updating user: ${error}`);
        throw new Error('Error updating user');
    }
};

const adminLogoutService = (res: Response) => {
    res.cookie("token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        expires: new Date(0),
        sameSite: "strict",
    });
    return { message: "Admin logged out successfully" };
};

export default { adminLoginService, getAllUsers, blockUser, unblockUser, adminLogoutService };
