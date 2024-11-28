import asyncHandler from "express-async-handler";
import { NextFunction, Request, Response } from "express";
import MovieService from "../Services/MovieService";
import { IMovie, Movie } from "../Models/MoviesModel";
import mongoose from "mongoose";

const languageMapping: { [key: string]: string } = {
  en: "Eng",
  ta: "Tam",
  ml: "Mal",
  hi: "Hindi",
  te: "Telugu",
};

class MovieController {
  async addMovieController(req: Request, res: Response): Promise<void> {
    try {
      const posterFile = (req.files as any)["poster"]?.[0];
      const movieImageFiles = (req.files as any)["movieImages"] || [];
      const castImageFiles = (req.files as any)["castImages"] || [];

      if (
        !posterFile ||
        movieImageFiles.length === 0 ||
        castImageFiles.length === 0
      ) {
        res.status(400).json({ message: "Please upload all required files." });
        return;
      }

      const movieData: Partial<IMovie> = {
        title: req.body.title,
        genres: req.body.genre.map((genre: string) => genre.toString()),
        duration: req.body.duration,
        description: req.body.description,
        director: req.body.director,
        languages: req.body.language.map(
          (lang: string) => languageMapping[lang] || lang
        ),
        casts: req.body.casts,
        releaseDate: req.body.releaseDate,
        posters: posterFile.filename,
        images: movieImageFiles.map((file: any) => file.filename),
        castsImages: castImageFiles.map((file: any) => file.filename),
      };

      const newMovie = await MovieService.addMovie(movieData);

      res
        .status(201)
        .json({ message: "Movie added successfully", movie: newMovie });
    } catch (error) {
      console.error("Error adding movie:", error);
      res.status(500).json({ message: "Failed to add movie", error });
    }
  }

  async getAllMoviesController(req: Request, res: Response): Promise<void> {
    try {
      const movies = await MovieService.getAllMovies();
      res.status(200).json({ movies });
    } catch (error) {
      res.status(500).json({ message: "Failed to get movies", error });
    }
  }

  getMovieByIdHandler = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const movieId = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(movieId)) {
        res.status(400).json({ message: "Invalid Movie ID" });
        return;
      }

      try {
        const movie = await Movie.findById(movieId);

        if (!movie) {
          res.status(404).json({ message: "Movie not found" });
          return;
        }

        res.json(movie.toObject());
      } catch (error) {
        console.error("Error in handler:", error);
        res.status(500).json({ message: "Server error" });
      }
    }
  );

  updateMovieHandler = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;
      const updateData = req.body;

      const posterFile = (req.files as any)["poster"]?.[0];
      const movieImageFiles = (req.files as any)["movieImages"] || [];
      const castImageFiles = (req.files as any)["castImages"] || [];

      try {
        const updatedMovie = await MovieService.updateMovieData(
          id,
          updateData,
          posterFile,
          movieImageFiles,
          castImageFiles
        );

        if (!updatedMovie) {
          res.status(404).json({ message: "Movie not found for updating" });
          return;
        }

        res.status(200).json(updatedMovie);
      } catch (error: any) {
        console.error("Error updating movie:", error);
        res
          .status(500)
          .json({ message: "Error updating movie", error: error.message });
      }
    }
  );

  deleteMovieHandler = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;

      try {
        const deletedMovie = await MovieService.deleteMovieService(id);

        if (!deletedMovie) {
          res.status(404).json({ message: "Movie not found for deletion" });
          return;
        }

        res
          .status(200)
          .json({ message: "Movie deleted successfully", deletedMovie });
      } catch (error: any) {
        console.error("Error deleting Movie:", error);
        res
          .status(500)
          .json({ message: "Error deleting Movie", error: error.message });
      }
    }
  );

  getReviewsController = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { movieId } = req.params;
  
      if (!mongoose.Types.ObjectId.isValid(movieId)) {
        res.status(400).json({ message: "Invalid Movie ID" });
        return;
      }
  
      try {
        const reviews = await MovieService.getReviewsByMovieId(movieId);
  
        if (!reviews.length) {
          res.status(404).json({ message: "No reviews found for this movie" });
          return;
        }
  
        res.status(200).json(reviews);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        res.status(500).json({ message: "Error fetching reviews", error });
      }
    }
  );  

  /**
   * Add a new review for a specific movie
   */
  addReviewsController = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {

      const { movieId, userId, rating, review } = req.body;

      if (
        !mongoose.Types.ObjectId.isValid(movieId) ||
        !mongoose.Types.ObjectId.isValid(userId)
      ) {
        res.status(400).json({ message: "Invalid Movie or User ID" });
        return;
      }

      if (!rating || !review) {
        res.status(400).json({ message: "Rating and comment are required" });
        return;
      }

      try {
        const newReview = await MovieService.addReview({
          movieId,
          userId,
          rating,
          review,
        });        

        res
          .status(201)
          .json({ message: "Review added successfully", newReview });
      } catch (error) {
        console.error("Error adding review:", error);
        res.status(500).json({ message: "Error adding review", error });
      }
    }
  );
}

export default new MovieController();
