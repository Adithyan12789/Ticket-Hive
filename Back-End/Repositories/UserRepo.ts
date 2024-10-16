// repositories/UserRepository.ts
import User, { IUser } from "../Models/UserModel";

export const findUserByEmail = async (email: string) => {
    return await User.findOne({ email });
};

export const saveUser = async (userData: IUser) => {
    const user = new User(userData);
    return await user.save();
};

export const findUserByResetToken = async (resetToken: string) => {
    return await User.findOne({
        resetPasswordToken: resetToken,
        resetPasswordExpires: { $gt: Date.now() },
    });
};

export const updateUser = async (userId: string, updates: object) => {
    return await User.findByIdAndUpdate(userId, updates, { new: true });
};
