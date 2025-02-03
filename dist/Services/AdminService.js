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
exports.AdminService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const GenerateAdminToken_1 = __importDefault(require("../Utils/GenerateAdminToken"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const AdminModel_1 = __importDefault(require("../Models/AdminModel"));
const inversify_1 = require("inversify");
const transporter = nodemailer_1.default.createTransport({
    service: "Gmail",
    auth: {
        user: "adithiruthiparambil12@gmail.com",
        pass: "phfa kacx ozkz ueig",
    },
});
let AdminService = class AdminService {
    constructor(adminRepository) {
        this.adminRepository = adminRepository;
    }
    async adminLoginService(email, password, res) {
        // Authenticate admin credentials via the repository
        const { email: adminEmail, password: adminPassword } = await this.adminRepository.authenticateAdmin(email, password);
        let _id = "";
        let existingAdmin = await AdminModel_1.default.findOne({ email: adminEmail });
        // If admin does not exist, create a new admin
        if (!existingAdmin) {
            const newAdmin = new AdminModel_1.default({
                name: "Admin",
                email: adminEmail,
                password: adminPassword,
            });
            await newAdmin.save();
            existingAdmin = newAdmin;
        }
        _id = existingAdmin._id.toString();
        const token = GenerateAdminToken_1.default.generateAdminToken(res, _id);
        return {
            _id,
            name: "Admin",
            email: adminEmail,
            token,
            isAdmin: true,
        };
    }
    async getAllUsers() {
        return this.adminRepository.getAllUsers();
    }
    async getAllTheaterOwners() {
        return await this.adminRepository.getAllTheaterOwners();
    }
    // AdminService.ts
    async blockUser(userId) {
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            throw new Error("Invalid userId format");
        }
        const updatedUser = await this.adminRepository.updateUser(userId, {
            isBlocked: true,
        });
        if (!updatedUser) {
            throw new Error("User not found");
        }
        return updatedUser;
    }
    async unblockUser(userId) {
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            throw new Error("Invalid userId format");
        }
        try {
            const updatedUser = await this.adminRepository.updateUser(userId, {
                isBlocked: false,
            });
            return updatedUser;
        }
        catch (error) {
            console.error(`Error updating user: ${error}`);
            throw new Error("Error updating user");
        }
    }
    async blockTheaterOwner(theaterOwnerId) {
        if (!mongoose_1.default.Types.ObjectId.isValid(theaterOwnerId)) {
            throw new Error("Invalid theaterOwnerId format");
        }
        try {
            const updatedTheaterOwner = await this.adminRepository.updatedTheaterOwner(theaterOwnerId, {
                isBlocked: true,
            });
            return updatedTheaterOwner;
        }
        catch (error) {
            console.error(`Error updating theater Owner: ${error}`);
            throw new Error("Error updating theater Owner");
        }
    }
    async unblockTheaterOwner(theaterOwnerId) {
        if (!mongoose_1.default.Types.ObjectId.isValid(theaterOwnerId)) {
            throw new Error("Invalid theaterOwnerId format");
        }
        try {
            const updatedTheaterOwner = await this.adminRepository.updatedTheaterOwner(theaterOwnerId, {
                isBlocked: false,
            });
            return updatedTheaterOwner;
        }
        catch (error) {
            console.error(`Error updating theater Owner: ${error}`);
            throw new Error("Error updating theater Owner");
        }
    }
    async getVerificationDetails() {
        return await this.adminRepository.getPendingTheaterOwnerVerifications();
    }
    async acceptVerification(theaterId) {
        const theater = await this.adminRepository.findTheaterById(theaterId);
        if (!theater) {
            throw new Error("Theater not found");
        }
        theater.verificationStatus = "accepted";
        theater.isVerified = true;
        await this.adminRepository.saveTheater(theater);
        const theaterOwner = await this.adminRepository.findTheaterOwnerById(theater.theaterOwnerId.toString());
        if (!theaterOwner) {
            throw new Error("Theater Owner not found");
        }
        await this.sendVerificationEmail(theaterOwner.email, "Verification Accepted", "Your verification request has been accepted.");
        return { message: "Verification accepted and email sent." };
    }
    async rejectVerification(theaterId, reason) {
        const theater = await this.adminRepository.findTheaterById(theaterId);
        if (!theater) {
            throw new Error("Theater not found");
        }
        theater.verificationStatus = "rejected";
        theater.isVerified = false;
        await this.adminRepository.saveTheater(theater);
        const theaterOwner = await this.adminRepository.findTheaterOwnerById(theater.theaterOwnerId.toString());
        if (!theaterOwner) {
            throw new Error("Theater Owner not found");
        }
        const message = `Your verification request has been rejected for the following reason: ${reason}`;
        await this.sendVerificationEmail(theaterOwner.email, "Verification Rejected", message);
        return { message: "Verification rejected and email sent." };
    }
    async getAllTicketsService() {
        const bookings = await this.adminRepository.findAllBookings();
        if (!bookings.length)
            throw new Error("No tickets found");
        return bookings.map((booking) => ({
            bookingId: booking._id,
            userId: booking.user._id,
            userName: booking.user.name,
            userEmail: booking.user.email,
            screenId: booking.screen._id,
            movieId: booking.movie._id,
            offerId: booking.offer?._id,
            movieTitle: booking.movie.title,
            theaterName: booking.theater.name,
            images: booking.theater.images,
            address: booking.theater.address,
            screenName: booking.screen.screenNumber,
            seats: booking.seats,
            showTime: booking.showTime,
            bookingDate: booking.bookingDate,
            paymentStatus: booking.paymentStatus,
            paymentMethod: booking.paymentMethod,
            totalPrice: booking.totalPrice,
        }));
    }
    async getAllAdmins() {
        let admins = await this.adminRepository.getAllAdmins();
        return admins;
    }
    async adminLogoutService(res) {
        res.cookie("token", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            expires: new Date(0),
            sameSite: "strict",
        });
        return { message: "Admin logged out successfully" };
    }
    async sendVerificationEmail(recipient, subject, message) {
        try {
            await transporter.sendMail({
                from: "adithiruthiparambil12@gmail.com",
                to: recipient,
                subject: subject,
                text: message,
            });
        }
        catch (error) {
            console.error("Error sending email:", error);
            throw error;
        }
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)("IAdminRepository")),
    __metadata("design:paramtypes", [Object])
], AdminService);
