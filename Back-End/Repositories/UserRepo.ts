// repositories/UserRepository.ts
import User, { IUser } from "../Models/UserModel";

// Function to find a user by email
export const findUserByEmail = async (email: string) => {
    return await User.findOne({ email });
};

// Function to save a new user
export const saveUser = async (userData: IUser) => {
    const user = new User(userData); // Create an instance of the User model with the provided user data
    return await user.save(); // Call save on the instance
};

// Function to find a user by reset password token
export const findUserByResetToken = async (resetToken: string) => {
    return await User.findOne({
        resetPasswordToken: resetToken,
        resetPasswordExpires: { $gt: Date.now() }, // Token not expired
    });
};

// Function to update a user's data
export const updateUser = async (userId: string, updates: object) => {
    return await User.findByIdAndUpdate(userId, updates, { new: true });
};
