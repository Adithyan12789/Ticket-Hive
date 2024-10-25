import dotenv from 'dotenv';
import User, { IUser } from '../Models/UserModel';
import mongoose from 'mongoose';
import TheaterOwner, { ITheaterOwner } from '../Models/TheaterOwnerModel';

dotenv.config();

class AdminRepository {
    public static getAdminCredentials() {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword) {
            throw new Error("Admin credentials are not configured properly");
        }

        return { adminEmail, adminPassword };
    }

    public static async getAllUsers(): Promise<IUser[]> {
        try {
            const users = await User.find({}, { name: 1, email: 1, phone: 1, isBlocked: 1 });
            return users;
        } catch (error) {
            throw new Error("Error fetching users");
        }
    }

    public static async getAllTheaterOwners(): Promise<ITheaterOwner[]> {
        try {
            const theaterOwners = await TheaterOwner.find({}, { name: 1, email: 1, phone: 1, isBlocked: 1 });
            return theaterOwners;
        } catch (error) {
            throw new Error("Error fetching theater owners");
        }
    }

    public static async updateUser(userId: string, userData: Partial<IUser>): Promise<IUser | null> {
        try {
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                console.error(`Invalid userId format: ${userId}`);
                throw new Error('Invalid userId format');
            }

            console.log(`Updating user with ID: ${userId}`);
            const user = await User.findById(userId);

            if (!user) {
                throw new Error('User not found');
            }

            if (userData.name !== undefined) user.name = userData.name;
            if (userData.email !== undefined) user.email = userData.email;
            if (userData.isBlocked !== undefined) user.isBlocked = userData.isBlocked;

            return await user.save();
        } catch (error: any) {
            console.error('Error in updateUser:', error);
            throw new Error(error.message);
        }
    }

    public static async updatedTheaterOwner(theaterOwnerId: string, theaterOwnerData: Partial<ITheaterOwner>): Promise<ITheaterOwner | null> {
        try {
            if (!mongoose.Types.ObjectId.isValid(theaterOwnerId)) {
                console.error(`Invalid theaterOwnerId format: ${theaterOwnerId}`);
                throw new Error('Invalid theaterOwnerId format');
            }

            console.log(`Updating theater Owner with ID: ${theaterOwnerId}`);
            const theaterOwner = await TheaterOwner.findById(theaterOwnerId);

            console.log("theaterOwnerData: ", theaterOwnerData);

            if (!theaterOwner) {
                throw new Error('Theater Owner not found');
            }

            // Update the actual theaterOwner document
            if (theaterOwnerData.name !== undefined) theaterOwner.name = theaterOwnerData.name;
            if (theaterOwnerData.email !== undefined) theaterOwner.email = theaterOwnerData.email;
            if (theaterOwnerData.isBlocked !== undefined) theaterOwner.isBlocked = theaterOwnerData.isBlocked;

            console.log("theaterOwner: ", theaterOwner);

            return await theaterOwner.save(); // Ensure save after update
        } catch (error: any) {
            console.error('Error in updatedTheaterOwner:', error);
            throw new Error(error.message);
        }
    }
}

export default AdminRepository;
