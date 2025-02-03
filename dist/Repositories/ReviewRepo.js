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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewRepository = void 0;
const inversify_1 = require("inversify");
const BaseRepository_1 = require("./Base/BaseRepository");
const ReviewModel_1 = require("../Models/ReviewModel");
const MoviesModel_1 = require("../Models/MoviesModel");
let ReviewRepository = class ReviewRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(ReviewModel_1.Review);
    }
    async getAllReviews() {
        return await ReviewModel_1.Review.find({}).populate("user", "name").populate("movie", "title");
    }
    async getReviewsByMovieId(movieId) {
        return await ReviewModel_1.Review.find({ movie: movieId }).populate("user", "name email");
    }
    async addReview(data) {
        const { movieId, userId, rating, review } = data;
        const newReview = new ReviewModel_1.Review({
            movie: movieId,
            user: userId,
            rating: rating,
            comment: review,
        });
        const savedReview = await newReview.save();
        // Add the review to the movie's reviews array
        await MoviesModel_1.Movie.findByIdAndUpdate(movieId, {
            $push: { reviews: savedReview._id },
        });
        return savedReview;
    }
    async updateAverageRating(movieId) {
        const reviews = await ReviewModel_1.Review.find({ movie: movieId });
        if (reviews.length > 0) {
            const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
            const averageRating = totalRating / reviews.length;
            await MoviesModel_1.Movie.findByIdAndUpdate(movieId, { averageRating });
        }
        else {
            await MoviesModel_1.Movie.findByIdAndUpdate(movieId, { averageRating: 0 });
        }
    }
};
exports.ReviewRepository = ReviewRepository;
exports.ReviewRepository = ReviewRepository = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [])
], ReviewRepository);
