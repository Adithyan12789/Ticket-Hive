"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const AdminRepo_1 = __importDefault(require("../Repositories/AdminRepo"));
const GenerateAdminToken_1 = __importDefault(require("../Utils/GenerateAdminToken"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const AdminModel_1 = __importDefault(require("../Models/AdminModel"));
const transporter = nodemailer_1.default.createTransport({
    service: "Gmail",
    auth: {
        user: "adithiruthiparambil12@gmail.com",
        pass: "phfa kacx ozkz ueig",
    },
});
class AdminService {
    async adminLoginService(email, password, res) {
        const { adminEmail, adminPassword } = AdminRepo_1.default.getAdminCredentials();
        let _id = "";
        if (email === adminEmail && password === adminPassword) {
            // Check if admin already exists in the database
            const existingAdmin = await AdminModel_1.default.findOne({ email: adminEmail });
            _id = existingAdmin?._id;
            if (!existingAdmin) {
                // If no existing admin, add to the database
                const newAdmin = new AdminModel_1.default({
                    name: "Admin",
                    email: adminEmail,
                    password: adminPassword,
                });
                _id = newAdmin._id;
                await newAdmin.save();
            }
            const token = GenerateAdminToken_1.default.generateAdminToken(res, _id);
            return {
                _id: existingAdmin?._id,
                name: "Admin",
                email: adminEmail,
                token: token,
                isAdmin: true,
            };
        }
        throw new Error("Invalid Admin Email or Password");
    }
    async getAllUsers() {
        return await AdminRepo_1.default.getAllUsers();
    }
    async getAllTheaterOwners() {
        return await AdminRepo_1.default.getAllTheaterOwners();
    }
    async blockUser(req) {
        const userId = req.body.userId;
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            throw new Error("Invalid userId format");
        }
        try {
            const updatedUser = await AdminRepo_1.default.updateUser(userId, {
                isBlocked: true,
            });
            return updatedUser;
        }
        catch (error) {
            console.error(`Error updating user: ${error}`);
            throw new Error("Error updating user");
        }
    }
    async unblockUser(req) {
        const userId = req.body.userId;
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            throw new Error("Invalid userId format");
        }
        try {
            const updatedUser = await AdminRepo_1.default.updateUser(userId, {
                isBlocked: false,
            });
            return updatedUser;
        }
        catch (error) {
            console.error(`Error updating user: ${error}`);
            throw new Error("Error updating user");
        }
    }
    async blockTheaterOwner(req) {
        const theaterOwnerId = req.body.theaterOwnerId;
        if (!mongoose_1.default.Types.ObjectId.isValid(theaterOwnerId)) {
            throw new Error("Invalid theaterOwnerId format");
        }
        try {
            const updatedTheaterOwner = await AdminRepo_1.default.updatedTheaterOwner(theaterOwnerId, { isBlocked: true });
            return updatedTheaterOwner;
        }
        catch (error) {
            console.error(`Error updating theater Owner: ${error}`);
            throw new Error("Error updating theater Owner");
        }
    }
    async unblockTheaterOwner(req) {
        const theaterOwnerId = req.body.theaterOwnerId;
        if (!mongoose_1.default.Types.ObjectId.isValid(theaterOwnerId)) {
            throw new Error("Invalid theaterOwnerId format");
        }
        try {
            const updatedTheaterOwner = await AdminRepo_1.default.updatedTheaterOwner(theaterOwnerId, { isBlocked: false });
            return updatedTheaterOwner;
        }
        catch (error) {
            console.error(`Error updating theater Owner: ${error}`);
            throw new Error("Error updating theater Owner");
        }
    }
    async getVerificationDetails() {
        return await AdminRepo_1.default.getPendingTheaterOwnerVerifications();
    }
    async acceptVerification(theaterId) {
        const theater = await AdminRepo_1.default.findTheaterById(theaterId);
        if (!theater) {
            throw new Error("Theater not found");
        }
        theater.verificationStatus = "accepted";
        theater.isVerified = true;
        await AdminRepo_1.default.saveTheater(theater);
        const theaterOwner = await AdminRepo_1.default.findTheaterOwnerById(theater.theaterOwnerId.toString());
        if (!theaterOwner) {
            throw new Error("Theater Owner not found");
        }
        await this.sendVerificationEmail(theaterOwner.email, "Verification Accepted", "Your verification request has been accepted.");
        return { message: "Verification accepted and email sent." };
    }
    async rejectVerification(theaterId, reason) {
        const theater = await AdminRepo_1.default.findTheaterById(theaterId);
        if (!theater) {
            throw new Error("Theater not found");
        }
        theater.verificationStatus = "rejected";
        theater.isVerified = false;
        await AdminRepo_1.default.saveTheater(theater);
        const theaterOwner = await AdminRepo_1.default.findTheaterOwnerById(theater.theaterOwnerId.toString());
        if (!theaterOwner) {
            throw new Error("Theater Owner not found");
        }
        const message = `Your verification request has been rejected for the following reason: ${reason}`;
        await this.sendVerificationEmail(theaterOwner.email, "Verification Rejected", message);
        return { message: "Verification rejected and email sent." };
    }
    async getAllTicketsService() {
        const bookings = await AdminRepo_1.default.findAllBookings();
        console.log("getAllTicketsService bookings: ", bookings);
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
        let admins = await AdminRepo_1.default.getAllAdmins();
        return admins;
    }
    adminLogoutService(res) {
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
}
exports.default = new AdminService();
