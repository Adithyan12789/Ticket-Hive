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

const getAllTheaterOwners = async () => {
    return await adminRepository.getAllTheaterOwners();
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

const blockTheaterOwner = async (req: Request): Promise<any> => {
    const theaterOwnerId = req.body.theaterOwnerId;
    console.log("theater Owner Id: ", theaterOwnerId);

    if (!mongoose.Types.ObjectId.isValid(theaterOwnerId)) {
        throw new Error('Invalid theaterOwnerId format');
    }

    try {
        console.log(`Updating theater OwnerId with ID: ${theaterOwnerId}`);
        const updatedTheaterOwner = await adminRepository.updatedTheaterOwner(theaterOwnerId, { isBlocked: true });

        console.log("updatedTheaterOwner: ", updatedTheaterOwner);
        

        return updatedTheaterOwner;
    } catch (error) {
        console.error(`Error updating theater Owner: ${error}`);
        throw new Error('Error updating theater Owner');
    }
};


const unblockTheaterOwner = async (req: Request): Promise<any> => {
    const theaterOwnerId = req.body.theaterOwnerId;
    console.log("Theater Owner Id: ", theaterOwnerId);

    if (!mongoose.Types.ObjectId.isValid(theaterOwnerId)) {
        throw new Error('Invalid theaterOwnerId format');
    }

    try {
        console.log(`Updating theater Owner with ID: ${theaterOwnerId}`);
        const updatedTheaterOwner = await adminRepository.updatedTheaterOwner(theaterOwnerId, { isBlocked: false });

        return updatedTheaterOwner;
    } catch (error) {
        console.error(`Error updating theater Owner: ${error}`);
        throw new Error('Error updating theater Owner');
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

export default { adminLoginService, getAllUsers, getAllTheaterOwners, blockUser, unblockUser, blockTheaterOwner, unblockTheaterOwner, adminLogoutService };
