// adminRepository.ts
import dotenv from 'dotenv';
import { asyncHandler } from '../Utils/asyncHandler';
import User from '../Models/UserModel';

dotenv.config();

// Function to get admin credentials from environment variables
const getAdminCredentials = () => {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
        throw new Error("Admin credentials are not configured properly");
    }

    return { adminEmail, adminPassword };
};

// Updated getAllUsers function to return data properly and handle errors
const getAllUsers = async () => {
    try {
        // Query to find all users
        const users = await User.find({}, { name: 1, email: 1});
        return users;
    } catch (error) {
        throw new Error("Error fetching users");
    }
};

export default { getAdminCredentials, getAllUsers };
