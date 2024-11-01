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
  // Add other mappings as necessary
};

class MovieController {
  async addMovieController(req: Request, res: Response): Promise<void> {
    try {
      console.log("body: ", req.body);
      console.log("Files: ", req.file);

      const movieData: Partial<IMovie> = {
        title: req.body.title,
        genres: req.body.genre.map((genre: string) => genre.toString()),
        duration: req.body.duration,
        description: req.body.description,
        languages: req.body.language.map(
          (lang: string) => languageMapping[lang] || lang
        ),
        casts: req.body.casts,
        releaseDate: req.body.releaseDate,
        posters: req.file ? req.file.filename : null,
      };

      const newMovie = await MovieService.addMovie(movieData);
      console.log("newMovie: ", newMovie);

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
      console.log("body 232r3: ", req.body);
      console.log("params: ", req.params);

      const { id } = req.params;
      const updateData = req.body;
      const file = req.file ? req.file.path : null;

      try {
        const updatedMovie = await MovieService.updateMovieData(
          id,
          updateData,
          file
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
}

export default new MovieController();
