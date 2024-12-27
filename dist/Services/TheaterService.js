"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const TheaterRepo_1 = __importDefault(require("../Repositories/TheaterRepo"));
const EmailUtil_1 = __importDefault(require("../Utils/EmailUtil"));
const TheaterOwnerModel_1 = __importDefault(require("../Models/TheaterOwnerModel"));
const TheaterDetailsModel_1 = __importDefault(require("../Models/TheaterDetailsModel"));
const MoviesModel_1 = require("../Models/MoviesModel");
const mongoose_1 = __importDefault(require("mongoose"));
const OffersModel_1 = require("../Models/OffersModel");
class TheaterOwnerService {
    constructor() {
        this.getTheaterOwnerProfile = async (theaterOwnerId) => {
            const theaterOwner = await TheaterRepo_1.default.findTheaterOwnerById(theaterOwnerId);
            if (!theaterOwner) {
                throw new Error("theater Owner not found");
            }
            return {
                _id: theaterOwner._id,
                name: theaterOwner.name,
                email: theaterOwner.email,
                phone: theaterOwner.phone,
                profileImageName: theaterOwner.profileImageName,
            };
        };
        this.updateTheaterOwnerProfileService = async (theaterOwnerId, updateData, profileImage) => {
            const theaterOwner = await TheaterRepo_1.default.findTheaterOwnerById(theaterOwnerId);
            if (!theaterOwner) {
                throw new Error("theater Owner not found");
            }
            if (updateData.currentPassword) {
                const isMatch = await theaterOwner.matchPassword(updateData.currentPassword);
                if (!isMatch) {
                    throw new Error("Current password is incorrect");
                }
            }
            theaterOwner.name = updateData.name || theaterOwner.name;
            theaterOwner.phone = updateData.phone || theaterOwner.phone;
            if (updateData.password) {
                const salt = await bcryptjs_1.default.genSalt(10);
                theaterOwner.password = await bcryptjs_1.default.hash(updateData.password, salt);
            }
            if (profileImage) {
                theaterOwner.profileImageName =
                    profileImage.filename || theaterOwner.profileImageName;
            }
            return await TheaterRepo_1.default.saveTheaterOwner(theaterOwner);
        };
        this.uploadCertificates = async (theaterId, certificatePath) => {
            const theater = await TheaterRepo_1.default.findTheaterById(theaterId);
            if (!theater) {
                throw new Error("Theater not found");
            }
            theater.certificate = certificatePath.replace("Back-End/public/", "");
            theater.verificationStatus = "pending";
            return await theater.save();
        };
        this.addTheaterService = async (theaterId, theaterData) => {
            const createdTheater = await TheaterRepo_1.default.createTheater(theaterId, theaterData);
            return { status: 201, data: createdTheater };
        };
        this.getTheatersByMovieTitle = async (movieTitle) => {
            try {
                const movie = await MoviesModel_1.Movie.findOne({ title: movieTitle }).exec();
                if (!movie) {
                    throw new Error("Movie not found");
                }
                const theaters = await TheaterDetailsModel_1.default.find({ movies: movie._id }).exec();
                return theaters;
            }
            catch (error) {
                throw new Error("Error fetching theater by movie name");
            }
        };
        this.updateOfferService = async (offerId, offerData) => {
            const { offerName, paymentMethod, offerDescription, discountValue, minPurchaseAmount, validityStart, validityEnd, applicableTheaters, } = offerData;
            // Validate input
            if (!offerName ||
                !paymentMethod ||
                !offerDescription ||
                !discountValue ||
                minPurchaseAmount === undefined ||
                !validityStart ||
                !validityEnd ||
                !Array.isArray(applicableTheaters) ||
                applicableTheaters.length === 0) {
                throw { statusCode: 400, message: "All fields are required" };
            }
            const parsedValidityStart = new Date(validityStart);
            const parsedValidityEnd = new Date(validityEnd);
            if (isNaN(parsedValidityStart.getTime()) ||
                isNaN(parsedValidityEnd.getTime())) {
                throw { statusCode: 400, message: "Invalid date format" };
            }
            // Convert applicableTheaters to ObjectId[]
            const theaterObjectIds = applicableTheaters.map((id) => new mongoose_1.default.Types.ObjectId(id));
            // Merge updates and pass to the repository
            const updatedOffer = await TheaterRepo_1.default.updateOffer(offerId, {
                ...offerData,
                validityStart: parsedValidityStart,
                validityEnd: parsedValidityEnd,
                applicableTheaters: theaterObjectIds,
            });
            if (!updatedOffer) {
                throw { statusCode: 404, message: "Offer not found" };
            }
            return updatedOffer;
        };
    }
    async authTheaterOwnerService(email, password) {
        const theater = await TheaterRepo_1.default.findTheaterOwnerByEmail(email);
        if (theater && (await theater.matchPassword(password))) {
            if (theater.isBlocked) {
                throw new Error("Your account has been blocked");
            }
            return theater;
        }
        throw new Error("Invalid Email or Password");
    }
    async registerTheaterOwnerService(name, email, password, phone) {
        const existingTheaterOwner = await TheaterOwnerModel_1.default.findOne({ email });
        if (existingTheaterOwner) {
            if (!existingTheaterOwner.otpVerified) {
                const otp = crypto_1.default.randomInt(100000, 999999).toString();
                existingTheaterOwner.otp = otp;
                existingTheaterOwner.otpVerified = false;
                existingTheaterOwner.otpGeneratedAt = new Date();
                await existingTheaterOwner.save();
                await EmailUtil_1.default.sendOtpEmail(existingTheaterOwner.email, otp);
                return existingTheaterOwner;
            }
            throw new Error("Email already exists.");
        }
        const otp = crypto_1.default.randomInt(100000, 999999).toString();
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        const newTheaterOwner = new TheaterOwnerModel_1.default({
            name,
            email,
            phone,
            password: hashedPassword,
            otp,
            otpVerified: false,
        });
        await newTheaterOwner.save();
        await EmailUtil_1.default.sendOtpEmail(newTheaterOwner.email, otp);
        return newTheaterOwner;
    }
    async verifyTheaterOwnerOtpService(email, otp) {
        const theater = await TheaterRepo_1.default.findTheaterOwnerByEmail(email);
        if (!theater) {
            throw new Error("Theater owner not found");
        }
        const OTP_EXPIRATION_TIME = 5 * 60 * 1000;
        if (new Date().getTime() - new Date(theater.otpGeneratedAt).getTime() >
            OTP_EXPIRATION_TIME) {
            throw new Error("OTP expired");
        }
        if (String(theater.otp) === String(otp)) {
            theater.otpVerified = true;
            await theater.save();
            return true;
        }
        throw new Error("Incorrect OTP");
    }
    async resendTheaterOwnerOtpService(email) {
        const theater = await TheaterRepo_1.default.findTheaterOwnerByEmail(email);
        if (!theater) {
            throw new Error("User not found");
        }
        const otp = crypto_1.default.randomInt(100000, 999999).toString();
        theater.otp = otp;
        theater.otpExpires = new Date(Date.now() + 1 * 60 * 1000 + 59 * 1000);
        try {
            await TheaterRepo_1.default.saveTheaterOwner(theater);
        }
        catch (err) {
            throw new Error("Failed to save user with new OTP");
        }
        try {
            await EmailUtil_1.default.sendOtpEmail(theater.email, otp);
        }
        catch (err) {
            throw new Error("Failed to send OTP email");
        }
        return theater;
    }
    async forgotTheaterOwnerPasswordService(email) {
        const theater = await TheaterRepo_1.default.findTheaterOwnerByEmail(email);
        if (!theater) {
            throw new Error("User not found");
        }
        const resetToken = crypto_1.default.randomBytes(32).toString("hex");
        theater.resetPasswordToken = resetToken;
        theater.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000);
        await theater.save();
        return resetToken;
    }
    async resetTheaterOwnerPasswordService(resetToken, password) {
        const theater = await TheaterRepo_1.default.findTheaterOwnerByResetToken(resetToken);
        if (!theater) {
            throw new Error("Invalid or expired token");
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        theater.password = await bcryptjs_1.default.hash(password, salt);
        theater.resetPasswordToken = undefined;
        theater.resetPasswordExpires = undefined;
        await theater.save();
        return true;
    }
    async getAllTheaterOwners() {
        let theaterOwners = await TheaterRepo_1.default.getAllTheaterOwners();
        return theaterOwners;
    }
    async getAllTheaters() {
        return await TheaterRepo_1.default.getAllTheaters();
    }
    async getTheaterById(theaterId) {
        try {
            const theater = await TheaterRepo_1.default.findTheaterById(theaterId);
            if (!theater) {
                return { status: 404, data: { message: "Theater not found" } };
            }
            return { status: 200, data: theater.toObject() };
        }
        catch (error) {
            console.error("Error fetching theater details:", error);
            return { status: 500, data: { message: "Server error" } };
        }
    }
    async updateTheaterData(theaterId, updateData, files) {
        try {
            const theater = await TheaterRepo_1.default.findTheaterById(theaterId);
            if (!theater) {
                throw new Error("Theater not found");
            }
            theater.name = updateData.name || theater.name;
            theater.city = updateData.city || theater.city;
            theater.address = updateData.address || theater.address;
            theater.description = updateData.description || theater.description;
            theater.amenities = updateData.amenities
                ? updateData.amenities.map((item) => item.trim())
                : theater.amenities;
            theater.latitude = updateData.latitude || theater.latitude;
            theater.longitude = updateData.longitude || theater.longitude;
            if (files && files.length > 0) {
                const newImages = files
                    .map((file) => {
                    return file.path.split("\\").pop()?.split("/").pop();
                })
                    .filter((image) => image !== undefined);
                theater.images = newImages;
            }
            if (Array.isArray(updateData.removeImages) &&
                updateData.removeImages.length > 0) {
                theater.images = theater.images.filter((image) => !updateData.removeImages.includes(image));
            }
            const updatedTheater = await theater.save();
            return updatedTheater;
        }
        catch (error) {
            throw error;
        }
    }
    async deleteTheaterService(id) {
        const deletedTheater = await TheaterDetailsModel_1.default.findByIdAndDelete(id);
        return deletedTheater;
    }
    async deleteOfferHandler(offerId) {
        const deletedOffer = await OffersModel_1.Offer.findByIdAndDelete(offerId);
        return deletedOffer;
    }
    logoutTheaterOwnerService() {
        return true;
    }
}
exports.default = new TheaterOwnerService();
