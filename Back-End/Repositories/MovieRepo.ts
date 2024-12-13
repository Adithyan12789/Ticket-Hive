import dotenv from "dotenv";
import { Movie, IMovie } from "../Models/MoviesModel";
import { Document } from "mongoose";

dotenv.config();

class MovieRepository {

  public static async addMovieRepo(
    movieData: Partial<IMovie>
  ): Promise<IMovie & Document> {
    const movie = new Movie(movieData);

    try {
      const savedMovie = await movie.save();
      return savedMovie;
    } catch (error) {
      console.error("Error saving movie:", error);
      throw error;
    }
  }

  public static async getAllMovies(): Promise<IMovie[]> {
    return await Movie.find();
  }

  public static async findMovieById(id: string): Promise<IMovie | null> {
    return await Movie.findById(id);
  }

}

export default MovieRepository;
