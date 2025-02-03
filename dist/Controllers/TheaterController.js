"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TheaterController = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const EmailUtil_1 = __importDefault(require("../Utils/EmailUtil"));
const GenerateTheaterToken_1 = __importDefault(require("../Utils/GenerateTheaterToken"));
const mongoose_1 = __importDefault(require("mongoose"));
const TheaterDetailsModel_1 = __importDefault(require("../Models/TheaterDetailsModel"));
const MoviesModel_1 = require("../Models/MoviesModel");
const ScreensModel_1 = require("../Models/ScreensModel");
const UserModel_1 = __importDefault(require("../Models/UserModel"));
const bookingModel_1 = require("../Models/bookingModel");
const ScheduleModel_1 = require("../Models/ScheduleModel");
const inversify_1 = require("inversify");
let TheaterController = class TheaterController {
    constructor(theaterService, offerService) {
        this.theaterService = theaterService;
        this.offerService = offerService;
        this.authTheaterOwner = (0, express_async_handler_1.default)(async (req, res) => {
            const { email, password } = req.body;
            if (!email || !password) {
                res.status(400).json({ message: "Email and password are required" });
                return;
            }
            try {
                const theater = await this.theaterService.authTheaterOwnerService(email, password);
                GenerateTheaterToken_1.default.generateTheaterToken(res, theater._id.toString());
                res.status(200).json({
                    id: theater._id,
                    name: theater.name,
                    email: theater.email,
                });
            }
            catch (err) {
                if (err instanceof Error) {
                    if (err.message === "Your account has been blocked") {
                        res.status(401).json({
                            message: "Your account has been blocked. Please contact support.",
                        });
                    }
                    else if (err.message === "Invalid Email or Password") {
                        res.status(401).json({ message: "Invalid email or password" });
                    }
                    else {
                        res
                            .status(500)
                            .json({ message: "An error occurred during authentication" });
                    }
                }
                else {
                    res
                        .status(500)
                        .json({ message: "An error occurred during authentication" });
                }
            }
        });
        this.googleLoginTheaterOwner = (0, express_async_handler_1.default)(async (req, res) => {
            const { googleName: name, googleEmail: email } = req.body;
            if (!email || !name) {
                res.status(400).json({ message: "Google Name and Email are required" });
                return;
            }
            try {
                const theaterOwner = await this.theaterService.googleLoginTheaterOwnerService(name, email);
                res.status(200).json({
                    success: true,
                    data: {
                        _id: theaterOwner._id,
                        name: theaterOwner.name,
                        email: theaterOwner.email,
                    },
                });
            }
            catch (error) {
                console.error("Error in Google Login:", error.message);
                res
                    .status(error.statusCode || 500)
                    .json({ message: error.message || "Internal server error" });
            }
        });
        this.registerTheaterOwner = (0, express_async_handler_1.default)(async (req, res) => {
            const { name, email, password, phone } = req.body;
            try {
                const theater = await this.theaterService.registerTheaterOwnerService(name, email, password, phone);
                const otpSent = !theater.otpVerified;
                res.status(201).json({
                    id: theater._id.toString(),
                    name: theater.name,
                    email: theater.email,
                    otpSent,
                    message: otpSent
                        ? "Theater Owner registered successfully. OTP sent."
                        : "Theater Owner already registered but OTP not verified.",
                });
            }
            catch (err) {
                if (err instanceof Error) {
                    if (err.message === "Email already exists.") {
                        res.status(400).json({
                            message: "Theater Owner with this email already exists",
                        });
                    }
                    else if (err.message === "Email exists but OTP is not verified.") {
                        res
                            .status(400)
                            .json({ message: "Email exists but OTP is not verified." });
                    }
                    else {
                        res
                            .status(500)
                            .json({ message: "An error occurred during registration" });
                    }
                }
                else {
                    res.status(500).json({ message: "An unexpected error occurred" });
                }
            }
        });
        this.verifyTheaterOwnerOTP = (0, express_async_handler_1.default)(async (req, res) => {
            const { email, otp } = req.body;
            try {
                await this.theaterService.verifyTheaterOwnerOtpService(email, otp);
                res.status(200).json({ message: "OTP verified successfully" });
            }
            catch (err) {
                if (err instanceof Error && err.message === "Incorrect OTP") {
                    res.status(400).json({ message: "Incorrect OTP" });
                }
                else if (err instanceof Error && err.message === "OTP expired") {
                    res
                        .status(400)
                        .json({ message: "OTP has expired. Please request a new one" });
                }
                else {
                    res
                        .status(500)
                        .json({ message: "An error occurred during OTP verification" });
                }
            }
        });
        this.resendTheaterOwnerOtp = (0, express_async_handler_1.default)(async (req, res) => {
            const { email } = req.body;
            try {
                await this.theaterService.resendTheaterOwnerOtpService(email);
                res.status(200).json({ message: "OTP resent successfully" });
            }
            catch (err) {
                if (err instanceof Error && err.message === "Theater Owner not found") {
                    res
                        .status(404)
                        .json({ message: "Theater Owner with this email not found" });
                }
                else if (err instanceof Error &&
                    err.message === "Failed to send OTP") {
                    res
                        .status(500)
                        .json({ message: "Failed to resend OTP. Please try again" });
                }
                else {
                    res.status(500).json({ message: "An unexpected error occurred" });
                }
            }
        });
        this.forgotTheaterOwnerPassword = (0, express_async_handler_1.default)(async (req, res) => {
            const { email } = req.body;
            if (!email) {
                res.status(400).json({ message: "Email is required" });
                return;
            }
            try {
                const resetToken = await this.theaterService.forgotTheaterOwnerPasswordService(email);
                const resetUrl = `http://localhost:5000/theater-reset-password/${resetToken}`;
                const message = `Password reset link: ${resetUrl}`;
                await EmailUtil_1.default.sendOtpEmail(email, message);
                res.status(200).json({ message: "Password reset email sent" });
            }
            catch (err) {
                if (err instanceof Error && err.message === "Theater Owner not found") {
                    res
                        .status(404)
                        .json({ message: "Theater Owner with this email not found" });
                }
                else if (err instanceof Error &&
                    err.message === "Failed to send email") {
                    res
                        .status(500)
                        .json({ message: "Failed to send reset email. Please try again" });
                }
                else {
                    res.status(500).json({
                        message: "An error occurred during password reset request",
                    });
                }
            }
        });
        this.resetTheaterOwnerPassword = (0, express_async_handler_1.default)(async (req, res) => {
            const { password } = req.body;
            const resetToken = req.params.token;
            if (!resetToken || !password) {
                res.status(400).json({ message: "Token and password are required" });
                return;
            }
            try {
                await this.theaterService.resetTheaterOwnerPasswordService(resetToken, password);
                res.status(200).json({ message: "Password reset successfully" });
            }
            catch (err) {
                if (err instanceof Error &&
                    err.message === "Invalid or expired token") {
                    res.status(400).json({ message: "Invalid or expired token" });
                }
                else {
                    res
                        .status(500)
                        .json({ message: "An error occurred during password reset" });
                }
            }
        });
        this.getTheaterOwners = (0, express_async_handler_1.default)(async (req, res) => {
            const admins = await this.theaterService.getAllTheaterOwners();
            res.status(200).json(admins);
        });
        this.getTheaterProfile = (0, express_async_handler_1.default)(async (req, res) => {
            const theaterOwnerId = req.theaterOwner?._id || null;
            if (!theaterOwnerId) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }
            const theaterOwner = await this.theaterService.getTheaterOwnerProfile(theaterOwnerId);
            res.status(200).json(theaterOwner);
        });
        this.updateTheaterProfile = (0, express_async_handler_1.default)(async (req, res) => {
            if (!req.theaterOwner) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }
            try {
                const updateData = { ...req.body };
                const fileData = req.file
                    ? { filename: req.file.filename }
                    : { filename: undefined };
                const updatedTheaterOwner = await this.theaterService.updateTheaterOwnerProfileService(req.theaterOwner._id, updateData, fileData);
                return res.status(200).json({
                    _id: updatedTheaterOwner._id,
                    name: updatedTheaterOwner.name,
                    phone: updatedTheaterOwner.phone,
                    profileImageName: updatedTheaterOwner.profileImageName,
                });
            }
            catch (err) {
                if (err instanceof Error &&
                    err.message === "Current password is incorrect") {
                    res.status(404).json({ message: "Current password is incorrect" });
                }
                else {
                    res.status(500).json({
                        message: "An error occurred",
                    });
                }
            }
        });
        this.uploadVerificationDetailsHandler = (0, express_async_handler_1.default)(async (req, res) => {
            const theaterId = req.params.theaterId;
            if (!req.file) {
                res.status(400).json({ message: "No file uploaded" });
                return;
            }
            const certificatePath = req.file.path
                .replace(/.*public[\\/]/, "")
                .replace(/\\/g, "/");
            try {
                await this.theaterService.uploadCertificates(theaterId, certificatePath);
                res
                    .status(200)
                    .json({ message: "Verification details submitted successfully" });
            }
            catch (error) {
                res.status(404).json({ message: error.message });
            }
        });
        this.addTheaterController = (0, express_async_handler_1.default)(async (req, res) => {
            const { name, city, address, showTimes, description, amenities, latitude, longitude, ticketPrice, } = req.body;
            if (!name ||
                !city ||
                !address ||
                !showTimes ||
                !description ||
                !latitude ||
                !longitude ||
                !ticketPrice) {
                res.status(400).json({ message: "All fields are required" });
                return;
            }
            if (!req.theaterOwner || req.theaterOwner.isBlocked) {
                res.status(403).json({ message: "Access denied" });
                return;
            }
            const images = Array.isArray(req.files)
                ? req.files.map((file) => {
                    return file.filename;
                })
                : [];
            try {
                const showTimesArray = Array.isArray(showTimes)
                    ? showTimes
                    : [showTimes];
                const response = await this.theaterService.addTheaterService(req.theaterOwner._id, {
                    theaterOwnerId: new mongoose_1.default.Types.ObjectId(req.theaterOwner._id),
                    name,
                    city,
                    address,
                    showTimes: showTimesArray.map((time) => time.trim()),
                    images,
                    description,
                    ticketPrice,
                    amenities: amenities
                        .split(",")
                        .map((amenity) => amenity.trim()),
                    latitude,
                    longitude,
                    isListed: true,
                });
                res.status(response.status).json(response.data);
            }
            catch (error) {
                console.error("Error adding theater:", error);
                res
                    .status(500)
                    .json({ message: "An error occurred while adding the theater" });
            }
        });
        this.getTheaters = (0, express_async_handler_1.default)(async (req, res) => {
            const theaters = await this.theaterService.getAllTheaters();
            res.status(200).json(theaters);
        });
        this.getTheaterByIdHandler = (0, express_async_handler_1.default)(async (req, res) => {
            const theaterId = req.params.id;
            if (!mongoose_1.default.Types.ObjectId.isValid(theaterId)) {
                res.status(400).json({ message: "Invalid Theater ID" });
                return;
            }
            try {
                const theater = await this.theaterService.getTheaterById(theaterId);
                if (!theater) {
                    res.status(404).json({ message: "Theater not found" });
                    return;
                }
                res.json(theater);
            }
            catch (error) {
                console.error("Error in handler:", error);
                res.status(500).json({ message: "Server error" });
            }
        });
        this.updateTheaterHandler = (0, express_async_handler_1.default)(async (req, res) => {
            const { id } = req.params;
            const updateData = req.body;
            const files = req.files;
            try {
                const updatedTheater = await this.theaterService.updateTheaterData(id, updateData, files);
                if (!updatedTheater) {
                    res.status(404).json({ message: "Theater not found for updating" });
                    return;
                }
                res.status(200).json(updatedTheater);
            }
            catch (error) {
                console.error("Error updating theater:", error);
                res.status(500).json({ message: "Error updating theater", error: error.message });
            }
        });
        this.deleteTheaterHandler = (0, express_async_handler_1.default)(async (req, res) => {
            const { id } = req.params;
            try {
                const deletedTheater = await this.theaterService.deleteTheaterService(id);
                if (!deletedTheater) {
                    res.status(404).json({ message: "Theater not found for deletion" });
                    return;
                }
                res
                    .status(200)
                    .json({ message: "Theater deleted successfully", deletedTheater });
            }
            catch (error) {
                console.error("Error deleting theater:", error);
                res
                    .status(500)
                    .json({ message: "Error deleting theater", error: error.message });
            }
        });
        this.getTheatersByMovieTitle = (0, express_async_handler_1.default)(async (req, res) => {
            const { movieTitle } = req.params;
            const { userId, date } = req.query;
            try {
                const user = await UserModel_1.default.findById(userId).select("-password");
                if (!user) {
                    res.status(404).json({ message: "User not found" });
                    return;
                }
                let movie;
                if (mongoose_1.default.Types.ObjectId.isValid(movieTitle)) {
                    movie = await MoviesModel_1.Movie.findById(movieTitle);
                }
                else {
                    movie = await MoviesModel_1.Movie.findOne({ title: movieTitle });
                }
                if (!movie) {
                    res.status(404).json({ message: "Movie not found" });
                    return;
                }
                const screens = await ScreensModel_1.Screens.find({
                    schedule: { $exists: true, $ne: [] },
                })
                    .populate({
                    path: "theater",
                    select: "name location amenities description ticketPrice owner address city longitude latitude",
                })
                    .populate({
                    path: "schedule",
                    populate: {
                        path: "showTimes.movie",
                        select: "title",
                    },
                });
                const screensWithMovie = screens.filter((screen) => screen.schedule.some((schedule) => schedule.showTimes.some((showTime) => showTime.movie.equals(movie._id))));
                const theaters = screensWithMovie
                    .map((screen) => screen.theater)
                    .filter((value, index, self) => value &&
                    self.findIndex((t) => t._id.toString() === value._id.toString()) === index);
                let filteredSchedules = await ScheduleModel_1.Schedule.find({
                    screen: { $in: screensWithMovie.map((screen) => screen._id) },
                    "showTimes.movie": movie._id,
                })
                    .populate({ path: "screen", select: "screenNumber theater" })
                    .populate({ path: "showTimes.movie", select: "title" });
                if (date && typeof date === "string") {
                    const selectedDate = new Date(date);
                    filteredSchedules = filteredSchedules.filter((schedule) => schedule.showTimes.some((showTime) => {
                        const showTimeDate = new Date(showTime.time);
                        return (showTimeDate.getFullYear() === selectedDate.getFullYear() &&
                            showTimeDate.getMonth() === selectedDate.getMonth() &&
                            showTimeDate.getDate() === selectedDate.getDate());
                    }));
                }
                res.status(200).json({
                    user,
                    theaters,
                    screens: screensWithMovie,
                    schedules: filteredSchedules,
                });
            }
            catch (err) {
                if (err instanceof Error) {
                    res.status(500).json({ message: "An error occurred", error: err.message });
                }
                else {
                    res.status(500).json({ message: "An unexpected error occurred" });
                }
            }
        });
        this.getStatsController = (0, express_async_handler_1.default)(async (req, res) => {
            try {
                const { ownerId } = req.params;
                // Fetch theaters for the given owner
                const theaters = await TheaterDetailsModel_1.default.find({ theaterOwnerId: ownerId });
                // Fetch bookings for these theaters, populating user and movie details
                const bookings = await bookingModel_1.Booking.find({
                    theater: { $in: theaters.map((t) => t._id) },
                })
                    .populate("user", "_id name email")
                    .populate("movie", "title"); // Populate movie title
                // Calculate total earnings from all bookings
                const totalEarnings = bookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
                // Calculate unique users by creating a Set of user IDs
                const uniqueUsers = new Set(bookings.map((booking) => booking.user._id.toString()));
                // Calculate unique movies by creating a Set of movie IDs
                const uniqueMovies = new Set(bookings.map((booking) => booking.movie._id.toString()));
                // Prepare stats
                const stats = {
                    theaters: theaters.length,
                    users: uniqueUsers.size, // Count of unique users
                    movies: uniqueMovies.size, // Count of unique movies
                    bookings: bookings.length,
                    totalEarnings,
                };
                // Return the stats and bookings with populated movie titles
                res.status(200).json({ stats, theaters, bookings });
            }
            catch (error) {
                console.error("Error fetching dashboard data:", error);
                res.status(500).json({ message: "Error fetching data", error: error });
            }
        });
        this.logoutTheaterOwner = (0, express_async_handler_1.default)(async (req, res) => {
            await this.theaterService.logoutTheaterOwnerService();
            res.cookie("theaterOwnerJwt", "", {
                httpOnly: true,
                secure: process.env.NODE_ENV !== "development",
                sameSite: "strict",
                expires: new Date(0),
            });
            res.status(200).json({ message: "Theater Owner Logged out" });
        });
    }
};
exports.TheaterController = TheaterController;
exports.TheaterController = TheaterController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)("ITheaterService")),
    __param(1, (0, inversify_1.inject)("IOfferService")),
    __metadata("design:paramtypes", [Object, Object])
], TheaterController);
