"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const UserModel_1 = __importDefault(require("../Models/UserModel"));
const TheaterOwnerModel_1 = __importDefault(require("../Models/TheaterOwnerModel"));
const TheaterDetailsModel_1 = __importDefault(require("../Models/TheaterDetailsModel"));
const mongoose_1 = __importDefault(require("mongoose"));
const bookingModel_1 = require("../Models/bookingModel");
const AdminModel_1 = __importDefault(require("../Models/AdminModel"));
dotenv_1.default.config();
class AdminRepository {
    static getAdminCredentials() {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        if (!adminEmail || !adminPassword) {
            throw new Error("Admin credentials are not configured properly");
        }
        return { adminEmail, adminPassword };
    }
    static async getAllUsers() {
        try {
            return await UserModel_1.default.find({}, { name: 1, email: 1, phone: 1, isBlocked: 1 });
        }
        catch (error) {
            console.error("Error fetching users:", error);
            throw new Error("Error fetching users");
        }
    }
    static async getAllTheaterOwners() {
        try {
            return await TheaterOwnerModel_1.default.find({}, { name: 1, email: 1, phone: 1, isBlocked: 1 });
        }
        catch (error) {
            console.error("Error fetching theater owners:", error);
            throw new Error("Error fetching theater owners");
        }
    }
    static async findAllBookings() {
        return await bookingModel_1.Booking.find({})
            .populate("user", "name email")
            .populate("movie theater screen offer")
            .lean();
    }
    static async updateUser(userId, userData) {
        try {
            if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
                console.error(`Invalid userId format: ${userId}`);
                throw new Error("Invalid userId format");
            }
            const user = await UserModel_1.default.findById(userId);
            if (!user)
                throw new Error("User not found");
            Object.assign(user, userData);
            return await user.save();
        }
        catch (error) {
            console.error("Error in updateUser:", error);
            throw new Error(error.message);
        }
    }
    static async updatedTheaterOwner(theaterOwnerId, theaterOwnerData) {
        try {
            if (!mongoose_1.default.Types.ObjectId.isValid(theaterOwnerId)) {
                console.error(`Invalid theaterOwnerId format: ${theaterOwnerId}`);
                throw new Error("Invalid theaterOwnerId format");
            }
            const theaterOwner = await TheaterOwnerModel_1.default.findById(theaterOwnerId);
            if (!theaterOwner)
                throw new Error("Theater Owner not found");
            Object.assign(theaterOwner, theaterOwnerData);
            return await theaterOwner.save();
        }
        catch (error) {
            console.error("Error in updatedTheaterOwner:", error);
            throw new Error(error.message);
        }
    }
    static async getPendingTheaterOwnerVerifications() {
        try {
            return await TheaterDetailsModel_1.default.find({ verificationStatus: "pending" }).select("-password");
        }
        catch (error) {
            console.error("Error fetching pending theater verifications:", error);
            throw new Error("Error fetching pending theater verifications");
        }
    }
    static async findTheaterOwnerById(id) {
        try {
            return await TheaterOwnerModel_1.default.findById(id);
        }
        catch (error) {
            console.error(`Error finding Theater Owner with ID: ${id}`, error);
            throw new Error("Error finding Theater Owner");
        }
    }
    static async findTheaterById(id) {
        try {
            return await TheaterDetailsModel_1.default.findById(id);
        }
        catch (error) {
            console.error(`Error finding Theater with ID: ${id}`, error);
            throw new Error("Error finding Theater");
        }
    }
    static async saveTheater(theater) {
        try {
            return await theater.save();
        }
        catch (error) {
            console.error("Error saving Theater:", error);
            throw new Error("Error saving Theater");
        }
    }
    static async getAllAdmins() {
        try {
            const admins = await AdminModel_1.default.find({});
            return admins;
        }
        catch (error) {
            throw new Error("Error fetching admins");
        }
    }
}
exports.default = AdminRepository;
