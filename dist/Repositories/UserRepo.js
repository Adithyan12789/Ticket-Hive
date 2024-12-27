"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bookingModel_1 = require("../Models/bookingModel");
const OffersModel_1 = require("../Models/OffersModel");
const UserModel_1 = __importDefault(require("../Models/UserModel"));
class UserRepository {
    async findUserByEmail(email) {
        return await UserModel_1.default.findOne({ email });
    }
    async saveUser(userData) {
        const user = new UserModel_1.default(userData);
        return await user.save();
    }
    async updateLocation(userId, city, latitude, longitude) {
        try {
            return await UserModel_1.default.findByIdAndUpdate(userId, { city, latitude, longitude }, { new: true });
        }
        catch (error) {
            throw new Error("Error updating location");
        }
    }
    async findUserByResetToken(resetToken) {
        return await UserModel_1.default.findOne({
            resetPasswordToken: resetToken,
            resetPasswordExpires: { $gt: Date.now() },
        });
    }
    async updateUser(userId, updates) {
        return await UserModel_1.default.findByIdAndUpdate(userId, updates, { new: true });
    }
    async findUserById(userId) {
        return await UserModel_1.default.findById(userId);
    }
    async findBookingsByUserId(userId) {
        return await bookingModel_1.Booking.find({ user: userId }).populate("movie theater screen").lean();
    }
    async findBookingById(bookingId) {
        return await bookingModel_1.Booking.findById(bookingId).populate("movie theater screen");
    }
    async deleteBookingById(bookingId) {
        return await bookingModel_1.Booking.findByIdAndDelete(bookingId);
    }
    async getOffersByTheaterId(theaterId) {
        return await OffersModel_1.Offer.find({ applicableTheaters: theaterId })
            .populate('applicableTheaters', 'name location')
            .populate('createdBy', 'name email ')
            .exec();
    }
}
exports.default = new UserRepository();
