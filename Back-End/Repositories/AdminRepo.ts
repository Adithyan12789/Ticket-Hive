import dotenv from 'dotenv';
import User, { IUser } from '../Models/UserModel';
import mongoose from 'mongoose';

dotenv.config();

const getAdminCredentials = () => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error("Admin credentials are not configured properly");
  }

  return { adminEmail, adminPassword };
};

const getAllUsers = async (): Promise<IUser[]> => {
  try {
    const users = await User.find({}, { name: 1, email: 1, phone: 1, isBlocked: 1 });
    return users;
  } catch (error) {
    throw new Error("Error fetching users");
  }
};


const updateUser = async (userId: string, userData: Partial<IUser>): Promise<IUser | null> => {
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
};


export default { getAdminCredentials, getAllUsers, updateUser };
