import MovieRepository from "../Repositories/MovieRepo";
import { IMovie, Movie } from "../Models/MoviesModel";
import { Review } from "../Models/ReviewModel";

class MovieService {
  public async addMovie(movieData: Partial<IMovie>): Promise<IMovie> {
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
      

      if (!movie) {
        throw new Error("Movie not found");
      }
      
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
    } catch (error) {
      console.error("Error updating movie:", error);
      throw error;
    }
  }

  public async deleteMovieService(id: string): Promise<IMovie | null> {
    const deletedMovie = await Movie.findByIdAndDelete(id);
    return deletedMovie;
  }

  public async getReviewsByMovieId(movieId: string) {
    return await Review.find({ movie: movieId }).populate("user", "name email");
  }

  public async addReview(data: { movieId: string; userId: string; rating: number; review: string }) {

    const review = new Review({
      movie: data.movieId,
      user: data.userId,
      rating: data.rating,
      comment: data.review,
    });
    
    return await review.save();
  }
}

export default new MovieService();
