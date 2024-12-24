"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const MoviesModel_1 = require("../Models/MoviesModel");
dotenv_1.default.config();
class MovieRepository {
    static async addMovieRepo(movieData) {
        const movie = new MoviesModel_1.Movie(movieData);
        try {
            const savedMovie = await movie.save();
            return savedMovie;
        }
        catch (error) {
            console.error("Error saving movie:", error);
            throw error;
        }
    }
    static async getAllMovies() {
        return await MoviesModel_1.Movie.find();
    }
    static async findMovieById(id) {
        return await MoviesModel_1.Movie.findById(id);
    }
}
exports.default = MovieRepository;
