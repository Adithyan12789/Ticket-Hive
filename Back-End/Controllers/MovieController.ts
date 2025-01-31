import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { inject, injectable } from "inversify"
import { IMovie, Movie } from "../Models/MoviesModel";
import mongoose from "mongoose";
import { IMovieService } from "../Interface/IMovie/IService";

const languageMapping: { [key: string]: string } = {
  en: "English",
  ta: "Tamil",
  ml: "Malalayalam",
  hi: "Hindi",
  te: "Telugu",
};

@injectable()
export class MovieController {
  constructor(
    @inject("IMovieService") private readonly movieService: IMovieService,
  ) {}

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

      const newMovie = await this.movieService.addMovie(movieData);

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
      if (!this.movieService) {
        throw new Error("MovieService is undefined");
      }
  
      const movies = await this.movieService.getAllMoviesService();
      res.status(200).json({ movies });
    } catch (error) {
      console.error("Error fetching movies:", error instanceof Error ? error.message : error);
      res.status(500).json({ message: "Failed to get movies" });
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
        const movie = await this.movieService.findMovieById(movieId);

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
        const updatedMovie = await this.movieService.updateMovieData(
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
        const deletedMovie = await this.movieService.deleteMovieService(id);

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