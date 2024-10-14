// adminService.ts
import adminRepository from '../Repositories/AdminRepo';
import generateAdminToken from '../Utils/GenerateAdminToken';
import { Response } from 'express';

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

const adminLogoutService = (res: Response) => {
    res.cookie("token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        expires: new Date(0),
        sameSite: "strict",
    });
    return { message: "Admin logged out successfully" };
};

export default { adminLoginService, adminLogoutService };
