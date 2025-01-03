"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const AdminService_1 = __importDefault(require("../Services/AdminService"));
const express_async_handler_2 = __importDefault(require("express-async-handler"));
const MoviesModel_1 = require("../Models/MoviesModel");
const OffersModel_1 = require("../Models/OffersModel");
class AdminController {
    constructor() {
        this.adminLogin = (0, express_async_handler_1.default)(async (req, res) => {
            const { email, password } = req.body;
            if (!email || !password) {
                res.status(400).json({ message: "Email and password are required" });
                return;
            }
            try {
                const adminData = await AdminService_1.default.adminLoginService(email, password, res);
                res.status(200).json(adminData);
            }
            catch (error) {
                res.status(400).json({ message: error.message });
            }
        });
        this.getAllUsers = (0, express_async_handler_2.default)(async (req, res) => {
            const users = await AdminService_1.default.getAllUsers();
            res.status(200).json(users);
        });
        this.getAllTheaterOwners = (0, express_async_handler_2.default)(async (req, res) => {
            const theaterOwners = await AdminService_1.default.getAllTheaterOwners();
            res.status(200).json(theaterOwners);
        });
        this.blockUserController = (0, express_async_handler_2.default)(async (req, res, next) => {
            try {
                const user = await AdminService_1.default.blockUser(req);
                if (user) {
                    res.status(200).json({ message: "User blocked successfully", user });
                }
                else {
                    res.status(404).json({ message: "User not found" });
                }
            }
            catch (error) {
                console.error("Error blocking user:", error);
                res.status(500).json({ message: "Error blocking user" });
            }
        });
        this.unblockUserController = (0, express_async_handler_2.default)(async (req, res, next) => {
            try {
                const user = await AdminService_1.default.unblockUser(req);
                if (user) {
                    res
                        .status(200)
                        .json({ message: "User unblocked successfully", user });
                }
                else {
                    res.status(404).json({ message: "User not found" });
                }
            }
            catch (error) {
                console.error("Error unblocking user:", error);
                res.status(500).json({ message: "Error unblocking user" });
            }
        });
        this.blockTheaterOwnerController = (0, express_async_handler_2.default)(async (req, res, next) => {
            try {
                const theaterOwner = await AdminService_1.default.blockTheaterOwner(req);
                if (theaterOwner) {
                    res.status(200).json({
                        message: "Theater Owner blocked successfully",
                        theaterOwner,
                    });
                }
                else {
                    res.status(404).json({ message: "Theater Owner not found" });
                }
            }
            catch (error) {
                console.error("Error blocking theater owner:", error);
                res.status(500).json({ message: "Error blocking theater owner" });
            }
        });
        this.unblockTheaterOwnerController = (0, express_async_handler_2.default)(async (req, res, next) => {
            try {
                const theaterOwner = await AdminService_1.default.unblockTheaterOwner(req);
                if (theaterOwner) {
                    res.status(200).json({
                        message: "Theater Owner unblocked successfully",
                        theaterOwner,
                    });
                }
                else {
                    res.status(404).json({ message: "Theater Owner not found" });
                }
            }
            catch (error) {
                console.error("Error unblocking theater owner:", error);
                res.status(500).json({ message: "Error unblocking theater owner" });
            }
        });
        this.getVerificationDetails = (0, express_async_handler_2.default)(async (req, res) => {
            const theaters = await AdminService_1.default.getVerificationDetails();
            res.status(200).json(theaters);
        });
        this.acceptVerification = (0, express_async_handler_2.default)(async (req, res) => {
            try {
                await AdminService_1.default.acceptVerification(req.params.theaterId);
                res.json({ message: "Verification accepted" });
            }
            catch (error) {
                console.error("Error accepting verification:", error);
                res.status(500).json({ message: "Server Error" });
            }
        });
        this.rejectVerification = (0, express_async_handler_2.default)(async (req, res) => {
            try {
                const { adminId } = req.params;
                const { reason } = req.body;
                await AdminService_1.default.rejectVerification(adminId, reason);
                res.json({ message: "Verification rejected" });
            }
            catch (error) {
                console.error("Error rejecting verification:", error);
                res.status(500).json({ message: "Server Error" });
            }
        });
        this.getAllTickets = (0, express_async_handler_1.default)(async (req, res) => {
            console.log("entered Admin getAllTickets function");
            try {
                const tickets = await AdminService_1.default.getAllTicketsService();
                console.log("admin getAllTickets: ", tickets);
                if (!tickets || tickets.length === 0) {
                    res.status(404).json({ message: "No tickets found for this user" });
                    return;
                }
                const ticketsWithMovieDetails = await Promise.all(tickets.map(async (ticket) => {
                    const movie = await MoviesModel_1.Movie.findById(ticket.movieId).exec();
                    const offer = await OffersModel_1.Offer.findById(ticket.offerId).exec();
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
                        offerDetails: offer
                            ? {
                                offerName: offer.offerName,
                                description: offer.description,
                                discountValue: offer.discountValue,
                                minPurchaseAmount: offer.minPurchaseAmount,
                                validityStart: offer.validityStart,
                                validityEnd: offer.validityEnd,
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
        this.getAdmins = (0, express_async_handler_1.default)(async (req, res) => {
            const admins = await AdminService_1.default.getAllAdmins();
            res.status(200).json(admins);
        });
        this.adminLogout = (0, express_async_handler_1.default)(async (req, res) => {
            const result = AdminService_1.default.adminLogoutService(res);
            res.status(200).json(result);
        });
    }
}
exports.default = new AdminController();
