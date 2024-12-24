"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const MovieRepo_1 = __importDefault(require("../Repositories/MovieRepo"));
const MoviesModel_1 = require("../Models/MoviesModel");
const ReviewModel_1 = require("../Models/ReviewModel");
class MovieService {
    async addMovie(movieData) {
        return await MovieRepo_1.default.addMovieRepo(movieData);
    }
    async getAllMovies() {
        return await MovieRepo_1.default.getAllMovies();
    }
    async updateMovieData(id, updateData, posterFile, movieImageFiles, castImageFiles) {
        try {
            const movie = await MovieRepo_1.default.findMovieById(id);
            if (!movie) {
                throw new Error("Movie not found");
            }
            movie.title = updateData.title || movie.title;
            movie.genres =
                updateData.genres && Array.isArray(updateData.genres)
                    ? updateData.genres.map((item) => item.trim())
                    : movie.genres;
            movie.duration = updateData.duration || movie.duration;
            movie.description = updateData.description || movie.description;
            movie.director = updateData.director || movie.director;
            movie.casts =
                updateData.casts && Array.isArray(updateData.casts)
                    ? updateData.casts.map((item) => item.trim())
                    : movie.casts;
            movie.languages =
                updateData.languages && Array.isArray(updateData.languages)
                    ? updateData.languages.map((item) => item.trim())
                    : movie.languages;
            movie.releaseDate = updateData.releaseDate || movie.releaseDate;
            if (posterFile) {
                movie.posters = posterFile.filename;
            }
            if (movieImageFiles && movieImageFiles.length > 0) {
                movie.images = movieImageFiles.map(file => file.filename);
            }
            if (castImageFiles && castImageFiles.length > 0) {
                movie.castsImages = castImageFiles.map(file => file.filename);
            }
            const updatedMovie = await movie.save();
            return updatedMovie;
        }
        catch (error) {
            console.error("Error updating movie:", error);
            throw error;
        }
    }
    async deleteMovieService(id) {
        const deletedMovie = await MoviesModel_1.Movie.findByIdAndDelete(id);
        return deletedMovie;
    }
    async getAllReviewsService() {
        return await ReviewModel_1.Review.find({}).populate('user', 'name').populate('movie', 'title');
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
}
exports.default = new MovieService();
