"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const MovieService_1 = __importDefault(require("../Services/MovieService"));
const MoviesModel_1 = require("../Models/MoviesModel");
const mongoose_1 = __importDefault(require("mongoose"));
const languageMapping = {
    en: "Eng",
    ta: "Tam",
    ml: "Mal",
    hi: "Hindi",
    te: "Telugu",
};
class MovieController {
    constructor() {
        this.getMovieByIdHandler = (0, express_async_handler_1.default)(async (req, res) => {
            const movieId = req.params.id;
            if (!mongoose_1.default.Types.ObjectId.isValid(movieId)) {
                res.status(400).json({ message: "Invalid Movie ID" });
                return;
            }
            try {
                const movie = await MoviesModel_1.Movie.findById(movieId);
                if (!movie) {
                    res.status(404).json({ message: "Movie not found" });
                    return;
                }
                res.json(movie.toObject());
            }
            catch (error) {
                console.error("Error in handler:", error);
                res.status(500).json({ message: "Server error" });
            }
        });
        this.updateMovieHandler = (0, express_async_handler_1.default)(async (req, res) => {
            const { id } = req.params;
            const updateData = req.body;
            const posterFile = req.files["poster"]?.[0];
            const movieImageFiles = req.files["movieImages"] || [];
            const castImageFiles = req.files["castImages"] || [];
            try {
                const updatedMovie = await MovieService_1.default.updateMovieData(id, updateData, posterFile, movieImageFiles, castImageFiles);
                if (!updatedMovie) {
                    res.status(404).json({ message: "Movie not found for updating" });
                    return;
                }
                res.status(200).json(updatedMovie);
            }
            catch (error) {
                console.error("Error updating movie:", error);
                res
                    .status(500)
                    .json({ message: "Error updating movie", error: error.message });
            }
        });
        this.deleteMovieHandler = (0, express_async_handler_1.default)(async (req, res) => {
            const { id } = req.params;
            try {
                const deletedMovie = await MovieService_1.default.deleteMovieService(id);
                if (!deletedMovie) {
                    res.status(404).json({ message: "Movie not found for deletion" });
                    return;
                }
                res
                    .status(200)
                    .json({ message: "Movie deleted successfully", deletedMovie });
            }
            catch (error) {
                console.error("Error deleting Movie:", error);
                res
                    .status(500)
                    .json({ message: "Error deleting Movie", error: error.message });
            }
        });
        this.getAllReviewsController = (0, express_async_handler_1.default)(async (req, res) => {
            try {
                const reviews = await MovieService_1.default.getAllReviewsService();
                if (!reviews.length) {
                    res.status(404).json({ message: "No reviews found for this movie" });
                    return;
                }
                res.status(200).json(reviews);
            }
            catch (error) {
                console.error("Error fetching reviews:", error);
                res.status(500).json({ message: "Error fetching reviews", error });
            }
        });
        this.getReviewsController = (0, express_async_handler_1.default)(async (req, res) => {
            const { movieId } = req.params;
            if (!mongoose_1.default.Types.ObjectId.isValid(movieId)) {
                res.status(400).json({ message: "Invalid Movie ID" });
                return;
            }
            try {
                const reviews = await MovieService_1.default.getReviewsByMovieId(movieId);
                if (!reviews.length) {
                    res.status(404).json({ message: "No reviews found for this movie" });
                    return;
                }
                res.status(200).json(reviews);
            }
            catch (error) {
                console.error("Error fetching reviews:", error);
                res.status(500).json({ message: "Error fetching reviews", error });
            }
        });
        this.addReviewsController = (0, express_async_handler_1.default)(async (req, res) => {
            const { movieId, userId, rating, review } = req.body;
            if (!mongoose_1.default.Types.ObjectId.isValid(movieId) || !mongoose_1.default.Types.ObjectId.isValid(userId)) {
                res.status(400).json({ message: "Invalid Movie or User ID" });
                return;
            }
            if (!rating || !review) {
                res.status(400).json({ message: "Rating and comment are required" });
                return;
            }
            try {
                const newReview = await MovieService_1.default.addReview({ movieId, userId, rating, review });
                // Recalculate and update average rating
                await MovieService_1.default.updateAverageRating(movieId);
                res.status(201).json({
                    message: "Review added successfully",
                    review: newReview,
                });
            }
            catch (error) {
                console.error("Error adding review:", error);
                res.status(500).json({ message: "Error adding review", error });
            }
        });
    }
    async addMovieController(req, res) {
        try {
            const posterFile = req.files["poster"]?.[0];
            const movieImageFiles = req.files["movieImages"] || [];
            const castImageFiles = req.files["castImages"] || [];
            if (!posterFile ||
                movieImageFiles.length === 0 ||
                castImageFiles.length === 0) {
                res.status(400).json({ message: "Please upload all required files." });
                return;
            }
            const movieData = {
                title: req.body.title,
                genres: req.body.genre.map((genre) => genre.toString()),
                duration: req.body.duration,
                description: req.body.description,
                director: req.body.director,
                languages: req.body.language.map((lang) => languageMapping[lang] || lang),
                casts: req.body.casts,
                releaseDate: req.body.releaseDate,
                posters: posterFile.filename,
                images: movieImageFiles.map((file) => file.filename),
                castsImages: castImageFiles.map((file) => file.filename),
            };
            const newMovie = await MovieService_1.default.addMovie(movieData);
            res
                .status(201)
                .json({ message: "Movie added successfully", movie: newMovie });
        }
        catch (error) {
            console.error("Error adding movie:", error);
            res.status(500).json({ message: "Failed to add movie", error });
        }
    }
    async getAllMoviesController(req, res) {
        try {
            const movies = await MovieService_1.default.getAllMovies();
            res.status(200).json({ movies });
        }
        catch (error) {
            res.status(500).json({ message: "Failed to get movies", error });
        }
    }
}
exports.default = new MovieController();
