"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const BookingService_1 = __importStar(require("../Services/BookingService"));
const BookingService_2 = __importDefault(require("../Services/BookingService"));
const MoviesModel_1 = require("../Models/MoviesModel");
const WalletService_1 = __importDefault(require("../Services/WalletService"));
const NotificationService_1 = __importDefault(require("../Services/NotificationService"));
class BookingController {
    constructor() {
        this.createBooking = (0, express_async_handler_1.default)(async (req, res) => {
            const { userId, scheduleId, theaterId, seatIds, screenId, bookingDate, showTime, totalPrice, paymentStatus, paymentMethod, convenienceFee, offerId, movieId, } = req.body;
            if (!movieId ||
                !scheduleId ||
                !theaterId ||
                !screenId ||
                !seatIds ||
                !showTime ||
                !userId ||
                !totalPrice ||
                !paymentStatus ||
                !paymentMethod ||
                !convenienceFee ||
                !bookingDate) {
                res.status(400).json({ message: "Missing required fields" });
                return;
            }
            try {
                const movieTitle = await (0, BookingService_1.getMovieTitleById)(movieId);
                if (!movieTitle) {
                    res.status(404).json({ message: "Movie not found" });
                    return;
                }
                if (paymentMethod === "wallet") {
                    const walletBalance = await WalletService_1.default.getWalletBalance(userId);
                    if (walletBalance < totalPrice) {
                        res.status(400).json({ message: "Insufficient wallet balance" });
                        return;
                    }
                    const description = `Payment for booking "${movieTitle}"`;
                    await WalletService_1.default.deductAmountFromWallet(userId, totalPrice, description);
                }
                const nextDay = new Date(bookingDate);
                nextDay.setDate(nextDay.getDate() + 1);
                const formattedNextDay = nextDay.toISOString();
                console.log(formattedNextDay);
                const booking = await BookingService_2.default.createBookingService(movieId, scheduleId, theaterId, screenId, seatIds, userId, offerId, totalPrice, showTime, paymentStatus, paymentMethod, convenienceFee, formattedNextDay);
                await NotificationService_1.default.addNotification(userId, `Your ticket for the movie "${movieTitle}" has been booked successfully.`);
                if (paymentMethod === "wallet") {
                    const cashbackPercentage = 10;
                    const cashbackAmount = (totalPrice * cashbackPercentage) / 100;
                    await WalletService_1.default.addCashbackToWallet(userId, cashbackAmount, `Cashback for booking "${movieTitle}"`);
                    await NotificationService_1.default.addNotification(userId, `You've received a cashback of ₹${cashbackAmount.toFixed(2)} for your booking of "${movieTitle}".`);
                }
                res.status(201).json({
                    message: "Booking successful",
                    booking,
                });
            }
            catch (err) {
                if (err instanceof Error) {
                    res.status(500).json({
                        message: "An error occurred during booking",
                        error: err.message,
                    });
                }
                else {
                    res.status(500).json({ message: "An unexpected error occurred" });
                }
            }
        });
        this.getUnreadNotifications = (0, express_async_handler_1.default)(async (req, res) => {
            try {
                const userId = req.user?._id;
                if (!userId) {
                    res.status(400).json({ message: "User ID is required" });
                    return;
                }
                const notifications = await NotificationService_1.default.getUnreadNotifications(userId);
                console.log("notifications: ", notifications);
                res.json(notifications);
            }
            catch (error) {
                res.status(500).json({ message: "Server error" });
            }
        });
        this.markNotificationAsRead = (0, express_async_handler_1.default)(async (req, res) => {
            console.log("enetered mark");
            const { id: notificationId } = req.params;
            console.log("req.params: ", req.params);
            console.log("notificationId: ", notificationId);
            const userId = req.user?._id;
            try {
                if (!userId) {
                    res.status(400).json({ message: "User ID is required" });
                    return;
                }
                const message = await NotificationService_1.default.markNotificationAsRead(userId, notificationId);
                res.json({ message });
            }
            catch (error) {
                res
                    .status(error.statusCode || 500)
                    .json({ message: error.message || "Server error" });
            }
        });
        this.clearNotifications = (0, express_async_handler_1.default)(async (req, res) => {
            const userId = req.user?._id;
            console.log("userId: ", userId);
            if (!userId) {
                res.status(400).json({ message: "User ID is required" });
                return;
            }
            try {
                await NotificationService_1.default.deleteAllNotifications(userId);
                res.json({ message: "All notifications cleared" });
            }
            catch (error) {
                res.status(500).json({ message: error.message || "Server error" });
            }
        });
        this.getAllTickets = (0, express_async_handler_1.default)(async (req, res) => {
            try {
                const userId = req.user?._id;
                if (!userId) {
                    res.status(401).json({ message: "Unauthorized access" });
                    return;
                }
                const tickets = await BookingService_2.default.getAllTicketsService(userId);
                if (!tickets || tickets.length === 0) {
                    res.status(404).json({ message: "No tickets found for this user" });
                    return;
                }
                const ticketsWithMovieDetails = await Promise.all(tickets.map(async (ticket) => {
                    const movie = await MoviesModel_1.Movie.findById(ticket.movieId).exec();
                    return {
                        ticket,
                        movieDetails: movie
                            ? {
                                title: movie.title,
                                poster: movie.posters,
                                duration: movie.duration,
                                genre: movie.genres,
                            }
                            : null,
                    };
                }));
                res.status(200).json({
                    success: true,
                    tickets: ticketsWithMovieDetails,
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: "Failed to retrieve tickets",
                    error: error instanceof Error ? error.message : "Unknown error",
                });
            }
        });
        this.cancelTicket = (0, express_async_handler_1.default)(async (req, res) => {
            const { bookingId } = req.params;
            const userId = req.user?._id;
            if (!bookingId || !userId) {
                res
                    .status(400)
                    .json({ message: "Booking ID and User ID are required" });
                return;
            }
            try {
                const cancellationResult = await BookingService_2.default.cancelTicketService(bookingId, userId);
                res.status(200).json({
                    success: true,
                    message: "Booking canceled successfully",
                    booking: cancellationResult,
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: "Failed to cancel booking",
                    error: error instanceof Error ? error.message : "Unknown error",
                });
            }
        });
        this.getTicketDetails = (0, express_async_handler_1.default)(async (req, res) => {
            try {
                const { ticketId } = req.params;
                const ticket = await BookingService_1.default.getTicketDetails(ticketId);
                if (ticket) {
                    res.status(200).json(ticket);
                }
                else {
                    res.status(404).json({ message: "Ticket not found" });
                }
            }
            catch (error) {
                console.error("Error fetching ticket details:", error.message);
                res.status(500).json({ message: "Failed to fetch ticket details" });
            }
        });
        this.updateBookingStatus = (0, express_async_handler_1.default)(async (req, res) => {
            const { bookingId } = req.params;
            const { status } = req.body;
            if (!status) {
                res.status(400).json({ message: "Status is required" });
                return;
            }
            try {
                const validStatuses = ["Pending", "Confirmed", "Cancelled"];
                if (!validStatuses.includes(status)) {
                    res.status(400).json({ message: "Invalid status" });
                    return;
                }
                const updatedBooking = await BookingService_2.default.updateBookingStatusService(bookingId, status);
                if (!updatedBooking) {
                    res.status(404).json({ message: "Booking not found" });
                    return;
                }
                res.status(200).json({
                    message: "Booking status updated successfully",
                    booking: updatedBooking,
                });
            }
            catch (error) {
                res.status(500).json({
                    message: "Failed to update booking status",
                    error: error instanceof Error ? error.message : "Unknown error",
                });
            }
        });
        this.updateTicket = (0, express_async_handler_1.default)(async (req, res) => {
            try {
                const { ticketId } = req.params;
                const updatedData = req.body;
                const updatedTicket = await BookingService_1.default.updateTicket(ticketId, updatedData);
                if (updatedTicket) {
                    res
                        .status(200)
                        .json({ message: "Ticket updated successfully", updatedTicket });
                }
                else {
                    res.status(404).json({ message: "Ticket not found" });
                }
            }
            catch (error) {
                console.error("Error updating ticket:", error.message);
                res.status(500).json({ message: "Failed to update ticket" });
            }
        });
        this.getUserBookings = (0, express_async_handler_1.default)(async (req, res) => {
            try {
                const { userId } = req.params;
                const bookings = await BookingService_1.default.getUserBookings(userId);
                res.status(200).json(bookings);
            }
            catch (error) {
                console.error("Error fetching user bookings:", error.message);
                res.status(500).json({ message: "Failed to fetch user bookings" });
            }
        });
        this.getTheaterBookings = (0, express_async_handler_1.default)(async (req, res) => {
            try {
                const { theaterId } = req.params;
                const bookings = await BookingService_1.default.getTheaterBookings(theaterId);
                res.status(200).json(bookings);
            }
            catch (error) {
                console.error("Error fetching theater bookings:", error.message);
                res.status(500).json({ message: "Failed to fetch theater bookings" });
            }
        });
    }
}
exports.default = new BookingController();
