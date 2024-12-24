"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const MoviesModel_1 = require("../Models/MoviesModel");
const OffersModel_1 = require("../Models/OffersModel");
const TheaterDetailsModel_1 = __importDefault(require("../Models/TheaterDetailsModel"));
const TheaterOwnerModel_1 = __importDefault(require("../Models/TheaterOwnerModel"));
class TheaterRepository {
    constructor() {
        this.createTheater = async (theaterId, theaterData) => {
            const theater = new TheaterDetailsModel_1.default({ ...theaterData, theaterId });
            return await theater.save();
        };
    }
    async getAllTheaterOwners() {
        try {
            const theaterOwner = await TheaterOwnerModel_1.default.find({});
            return theaterOwner;
        }
        catch (error) {
            throw new Error("Error fetching theater owners");
        }
    }
    async findTheaterOwnerById(theaterOwnerId) {
        return await TheaterOwnerModel_1.default.findById(theaterOwnerId);
    }
    async findTheaterById(theaterId) {
        return await TheaterDetailsModel_1.default.findById(theaterId);
    }
    async findTheaterOwnerByEmail(email) {
        return await TheaterOwnerModel_1.default.findOne({ email });
    }
    async saveTheaterOwner(theaterOwnerData) {
        const theater = new TheaterOwnerModel_1.default(theaterOwnerData);
        return await theater.save();
    }
    async findTheaterOwnerByResetToken(resetToken) {
        return await TheaterOwnerModel_1.default.findOne({
            resetPasswordToken: resetToken,
            resetPasswordExpires: { $gt: Date.now() },
        });
    }
    async getAllTheaters() {
        try {
            const theaters = await TheaterDetailsModel_1.default.find({});
            return theaters;
        }
        catch (error) {
            throw new Error("Error fetching theater owners");
        }
    }
    async updateTheaterOwner(theaterOwnerId, updates) {
        return await TheaterOwnerModel_1.default.findByIdAndUpdate(theaterOwnerId, updates, { new: true });
    }
    async findTheatersByMovieTitle(movieTitle) {
        try {
            const movie = await MoviesModel_1.Movie.findOne({ title: movieTitle }).exec();
            if (!movie) {
                throw new Error('Movie not found');
            }
            const theaters = await TheaterDetailsModel_1.default.find({ movies: movie._id }).exec();
            return theaters;
        }
        catch (error) {
            throw new Error("Error fetching theater by movie name");
        }
    }
    async updateOffer(offerId, updates) {
        try {
            const offer = await OffersModel_1.Offer.findByIdAndUpdate(offerId, updates, {
                new: true,
            });
            if (!offer) {
                throw { statusCode: 404, message: "Offer not found" };
            }
            return offer;
        }
        catch (error) {
            console.error("Error updating the offer:", error);
            throw { statusCode: 500, message: "Internal server error" };
        }
    }
}
exports.default = new TheaterRepository();
