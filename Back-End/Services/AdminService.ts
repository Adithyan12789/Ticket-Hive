// adminService.ts
import adminRepository from '../Repositories/AdminRepo';
import generateAdminToken from '../Utils/GenerateAdminToken';
import { Response } from 'express';

// Service for handling admin login
const adminLoginService = (email: string, password: string, res: Response) => {
    const { adminEmail, adminPassword } = adminRepository.getAdminCredentials();

    // Check if the provided email and password match the admin credentials
    if (email === adminEmail && password === adminPassword) {
        const token = generateAdminToken(res, "admin"); // Generate token
        return {
            id: "admin",
            name: "Admin User",
            email: adminEmail,
            token: token,
            isAdmin: true
        };
    }

    // Return a structured error response if credentials are invalid
    throw new Error("Invalid Admin Email or Password");
};

// Get all users - Call repository method directly (no need for asyncHandler here)
const getAllUsers = async () => {
    return await adminRepository.getAllUsers(); // Direct call to the repository method
};

// Service to handle admin logout
const adminLogoutService = (res: Response) => {
    res.cookie("token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        expires: new Date(0),
        sameSite: "strict",
    });
    return { message: "Admin logged out successfully" };
};

export default { adminLoginService, getAllUsers, adminLogoutService };
