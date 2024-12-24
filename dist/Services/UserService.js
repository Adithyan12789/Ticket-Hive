"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const UserRepo_1 = __importDefault(require("../Repositories/UserRepo"));
const EmailUtil_1 = __importDefault(require("../Utils/EmailUtil"));
const UserModel_1 = __importDefault(require("../Models/UserModel"));
class UserService {
    constructor() {
        this.getUserProfile = async (userId) => {
            const user = await UserRepo_1.default.findUserById(userId);
            if (!user) {
                throw new Error("User not found");
            }
            return {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                city: user.city,
                profileImageName: user.profileImageName,
            };
        };
        this.updateUserProfileService = async (userId, updateData, profileImage) => {
            const user = await UserRepo_1.default.findUserById(userId);
            if (!user) {
                throw new Error("User not found");
            }
            // Only check current password if user is updating their password
            if (updateData.password && updateData.currentPassword) {
                const isMatch = await user.matchPassword(updateData.currentPassword);
                if (!isMatch) {
                    throw new Error("Current password is incorrect");
                }
            }
            user.name = updateData.name || user.name;
            user.phone = updateData.phone || user.phone;
            // If a new password is provided, hash it
            if (updateData.password) {
                const salt = await bcryptjs_1.default.genSalt(10);
                user.password = await bcryptjs_1.default.hash(updateData.password, salt);
            }
            // If a new profile image is uploaded, update the image filename
            if (profileImage) {
                user.profileImageName = profileImage.filename || user.profileImageName;
            }
            return await UserRepo_1.default.saveUser(user);
        };
        this.getOffersByTheaterIdService = async (theaterId) => {
            try {
                return await UserRepo_1.default.getOffersByTheaterId(theaterId);
            }
            catch (error) {
                throw new Error("Error fetching Offers");
            }
        };
    }
    async authenticateUser(email, password) {
        const user = await UserRepo_1.default.findUserByEmail(email);
        if (user) {
            if (user.isBlocked) {
                throw new Error("Your account is blocked");
            }
            if (await user.matchPassword(password)) {
                return user;
            }
        }
        throw new Error("Invalid Email or Password");
    }
    async registerUserService(name, email, password, phone) {
        const existingUser = await UserModel_1.default.findOne({ email });
        if (existingUser) {
            if (!existingUser.otpVerified) {
                const otp = crypto_1.default.randomInt(100000, 999999).toString();
                existingUser.otp = otp;
                existingUser.otpVerified = false;
                existingUser.otpGeneratedAt = new Date();
                await existingUser.save();
                await EmailUtil_1.default.sendOtpEmail(existingUser.email, otp);
                return existingUser;
            }
            throw new Error("Email already exists.");
        }
        const otp = crypto_1.default.randomInt(100000, 999999).toString();
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        const newUser = new UserModel_1.default({
            name,
            email,
            phone,
            password: hashedPassword,
            otp,
            otpVerified: false,
        });
        await newUser.save();
        await EmailUtil_1.default.sendOtpEmail(newUser.email, otp);
        return newUser;
    }
    async verifyOtpService(email, otp) {
        const user = await UserRepo_1.default.findUserByEmail(email);
        if (!user) {
            throw new Error("User not found");
        }
        const OTP_EXPIRATION_TIME = 5 * 60 * 1000;
        if (!user.otpGeneratedAt) {
            throw new Error("OTP generation time is missing");
        }
        const otpGeneratedAt = user.otpGeneratedAt || new Date(0);
        if (new Date().getTime() - otpGeneratedAt.getTime() > OTP_EXPIRATION_TIME) {
            throw new Error("OTP expired");
        }
        if (String(user.otp) === String(otp)) {
            user.otpVerified = true;
            await user.save();
            return true;
        }
        throw new Error("Incorrect OTP");
    }
    async resendOtpService(email) {
        const user = await UserRepo_1.default.findUserByEmail(email);
        if (!user) {
            throw new Error("User not found");
        }
        const otp = crypto_1.default.randomInt(100000, 999999).toString();
        user.otp = otp;
        user.otpExpires = new Date(Date.now() + 1 * 60 * 1000 + 59 * 1000);
        try {
            await UserRepo_1.default.saveUser(user);
        }
        catch (err) {
            throw new Error("Failed to save user with new OTP");
        }
        try {
            await EmailUtil_1.default.sendOtpEmail(user.email, otp);
        }
        catch (err) {
            throw new Error("Failed to send OTP email");
        }
        return user;
    }
    async forgotPasswordService(email) {
        const user = await UserRepo_1.default.findUserByEmail(email);
        if (!user) {
            throw new Error("User not found");
        }
        const resetToken = crypto_1.default.randomBytes(32).toString("hex");
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000);
        await user.save();
        return resetToken;
    }
    async resetPasswordService(resetToken, password) {
        const user = await UserRepo_1.default.findUserByResetToken(resetToken);
        if (!user) {
            throw new Error("Invalid or expired token");
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        user.password = await bcryptjs_1.default.hash(password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        return true;
    }
    async updateLocation(userId, city, latitude, longitude) {
        try {
            // Call the repository method to update the location
            return await UserRepo_1.default.updateLocation(userId, city, latitude, longitude);
        }
        catch (error) {
            throw new Error("Service: Error updating location");
        }
    }
    logoutUserService() {
        return true;
    }
}
exports.default = new UserService();
