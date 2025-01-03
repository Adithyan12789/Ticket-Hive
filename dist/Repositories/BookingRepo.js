"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bookingModel_1 = require("../Models/bookingModel");
const UserModel_1 = __importDefault(require("../Models/UserModel"));
class BookingRepository {
    async findAllBookings(userId) {
        return await bookingModel_1.Booking.find({ "user": userId })
            .populate("user", "name email")
            .populate("movie theater screen")
            .lean();
    }
    async findUserById(userId) {
        return await UserModel_1.default.findById(userId);
    }
    async findBookingsByUserId(userId) {
        return await bookingModel_1.Booking.find({ user: userId }).populate("movie theater screen").lean();
    }
    async findTicketById(ticketId) {
        return await bookingModel_1.Booking.findById(ticketId).populate("movie theater screen");
    }
    async findBookingById(bookingId) {
        return await bookingModel_1.Booking.findById(bookingId).populate("movie theater screen");
    }
    async deleteBookingById(bookingId) {
        return await bookingModel_1.Booking.findByIdAndDelete(bookingId);
    }
    async createBooking(data) {
        return await bookingModel_1.Booking.create(data);
    }
    async updateBookingStatus(bookingId, status) {
        try {
            const updatedBooking = await bookingModel_1.Booking.findOneAndUpdate({ _id: bookingId }, { paymentStatus: status }, { new: true }).exec();
            return updatedBooking;
        }
        catch (error) {
            console.error("Error updating booking status:", error.message);
            throw new Error("Error updating booking status");
        }
    }
    async updateBooking(bookingId, updatedData) {
        return await bookingModel_1.Booking.findByIdAndUpdate(bookingId, updatedData, { new: true });
    }
    async getUserBookings(userId) {
        return await this.findBookingsByUserId(userId);
    }
    async getTheaterBookings(theaterId) {
        return await bookingModel_1.Booking.find({ theater: theaterId })
            .populate("user", "name email")
            .populate("movie", "title")
            .populate("screen", "screenName");
    }
}
exports.default = new BookingRepository();
