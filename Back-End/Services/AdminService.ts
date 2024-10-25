import mongoose from "mongoose";
import AdminRepository from "../Repositories/AdminRepo";
import AdminTokenService from '../Utils/GenerateAdminToken';
import { Request, Response } from 'express';

class AdminService {
    
    public async adminLoginService(email: string, password: string, res: Response) {
        const { adminEmail, adminPassword } = AdminRepository.getAdminCredentials();

        if (email === adminEmail && password === adminPassword) {
            const token = AdminTokenService.generateAdminToken(res, "admin");
            return {
                id: "admin",
                name: "Admin User",
                email: adminEmail,
                token: token,
                isAdmin: true
            };
        }

        throw new Error("Invalid Admin Email or Password");
    }

    public async getAllUsers() {
        return await AdminRepository.getAllUsers();
    }

    public async getAllTheaterOwners() {
        return await AdminRepository.getAllTheaterOwners();
    }

    public async blockUser(req: Request): Promise<any> {
        const userId = req.body.userId;
        console.log("User Id: ", userId);

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new Error('Invalid userId format');
        }

        try {
            console.log(`Updating user with ID: ${userId}`);
            const updatedUser = await AdminRepository.updateUser(userId, { isBlocked: true });

            return updatedUser;
        } catch (error) {
            console.error(`Error updating user: ${error}`);
            throw new Error('Error updating user');
        }
    }

    public async unblockUser(req: Request): Promise<any> {
        const userId = req.body.userId;
        console.log("User Id: ", userId);

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new Error('Invalid userId format');
        }

        try {
            console.log(`Updating user with ID: ${userId}`);
            const updatedUser = await AdminRepository.updateUser(userId, { isBlocked: false });

            return updatedUser;
        } catch (error) {
            console.error(`Error updating user: ${error}`);
            throw new Error('Error updating user');
        }
    }

    public async blockTheaterOwner(req: Request): Promise<any> {
        const theaterOwnerId = req.body.theaterOwnerId;
        console.log("Theater Owner Id: ", theaterOwnerId);

        if (!mongoose.Types.ObjectId.isValid(theaterOwnerId)) {
            throw new Error('Invalid theaterOwnerId format');
        }

        try {
            console.log(`Updating theater OwnerId with ID: ${theaterOwnerId}`);
            const updatedTheaterOwner = await AdminRepository.updatedTheaterOwner(theaterOwnerId, { isBlocked: true });

            console.log("updatedTheaterOwner: ", updatedTheaterOwner);
            return updatedTheaterOwner;
        } catch (error) {
            console.error(`Error updating theater Owner: ${error}`);
            throw new Error('Error updating theater Owner');
        }
    }

    public async unblockTheaterOwner(req: Request): Promise<any> {
        const theaterOwnerId = req.body.theaterOwnerId;
        console.log("Theater Owner Id: ", theaterOwnerId);

        if (!mongoose.Types.ObjectId.isValid(theaterOwnerId)) {
            throw new Error('Invalid theaterOwnerId format');
        }

        try {
            console.log(`Updating theater Owner with ID: ${theaterOwnerId}`);
            const updatedTheaterOwner = await AdminRepository.updatedTheaterOwner(theaterOwnerId, { isBlocked: false });

            return updatedTheaterOwner;
        } catch (error) {
            console.error(`Error updating theater Owner: ${error}`);
            throw new Error('Error updating theater Owner');
        }
    }

    public adminLogoutService(res: Response) {
        res.cookie("token", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            expires: new Date(0),
            sameSite: "strict",
        });
        return { message: "Admin logged out successfully" };
    }
}

export default new AdminService();
