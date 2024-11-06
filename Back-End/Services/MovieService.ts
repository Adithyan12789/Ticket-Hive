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
    posterFile: { filename: string } | null,
    movieImageFiles: { filename: string }[],
    castImageFiles: { filename: string }[]    
  ) {
    try {
      const movie = await MovieRepository.findMovieById(id);

      console.log("movie: ", movie);
      

      if (!movie) {
        throw new Error("Movie not found");
      }

      console.log("updateData: ", updateData);
      console.log("posterFile: ", posterFile);
      console.log("movieImageFiles: ", movieImageFiles);
      console.log("castImageFiles: ", castImageFiles);
      
      movie.title = updateData.title || movie.title;
      movie.genres =
        updateData.genres && Array.isArray(updateData.genres)
          ? updateData.genres.map((item: string) => item.trim())
          : movie.genres;
      movie.duration = updateData.duration || movie.duration;
      movie.description = updateData.description || movie.description;
      movie.director = updateData.director || movie.director;
      movie.casts =
        updateData.casts && Array.isArray(updateData.casts)
          ? updateData.casts.map((item: string) => item.trim())
          : movie.casts;
      movie.languages =
        updateData.languages && Array.isArray(updateData.languages)
          ? updateData.languages.map((item: string) => item.trim())
          : movie.languages;
      movie.releaseDate = updateData.releaseDate || movie.releaseDate;

      console.log("Type of posterFile:", typeof posterFile);

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
      console.log("service updated movie: ", updatedMovie);
      
      return updatedMovie;
    } catch (error) {
      console.error("Error updating movie:", error);
      throw error;
    }
  }

  public async deleteMovieService(id: string): Promise<IMovie | null> {
    const deletedMovie = await Movie.findByIdAndDelete(id);
    return deletedMovie;
  }
}

export default new MovieService();
