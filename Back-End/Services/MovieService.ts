import MovieRepository from "../Repositories/MovieRepo";
import { IMovie, Movie } from "../Models/MoviesModel";


class MovieService {

  public async addMovie(movieData: Partial<IMovie>): Promise<IMovie> {
    console.log("Inside addMovie service method.");
    console.log("Movie data being added:", movieData);
    return await MovieRepository.addMovieRepo(movieData);
  }

  public async getAllMovies(): Promise<IMovie[]> {
    return await MovieRepository.getAllMovies();
  }

  public async updateMovieData(
    id: string,
    updateData: Partial<IMovie>,
    file: string | null
  ) {
    try {
      const movie = await MovieRepository.findMovieById(id);

      if (!movie) {
        throw new Error("Movie not found");
      }

      movie.title = updateData.title || movie.title;
      movie.genres = updateData.genres && Array.isArray(updateData.genres)
      ? updateData.genres.map((item: string) => item.trim())
      : movie.genres;
      movie.duration = updateData.duration || movie.duration;
      movie.description = updateData.description || movie.description;
      movie.casts = updateData.casts && Array.isArray(updateData.casts)
      ? updateData.casts.map((item: string) => item.trim())
      : movie.casts; 
      movie.languages = updateData.languages && Array.isArray(updateData.languages)
      ? updateData.languages.map((item: string) => item.trim())
      : movie.languages;    
      movie.releaseDate = updateData.releaseDate || movie.releaseDate;

      if (file) {
        const newPoster = file.split("\\").pop()?.split("/").pop();
        if (newPoster) {
          movie.posters = newPoster;
        }
      }

      const updatedMovie = await movie.save();
      return updatedMovie;
    } catch (error) {
      throw error;
    }
  }

  public async deleteMovieService(
    id: string
  ): Promise<IMovie | null> {
    const deletedMovie = await Movie.findByIdAndDelete(id);
    return deletedMovie;
  }

}

export default new MovieService();
