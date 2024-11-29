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

  public async getAllReviewsService() {
    return await Review.find({}).populate('user', 'name').populate('movie', 'title');
  }  
  
  public async getReviewsByMovieId(movieId: string) {
    return await Review.find({ movie: movieId }).populate("user", "name email");
  }

  public async addReview(data: { movieId: string; userId: string; rating: number; review: string }) {
    const { movieId, userId, rating, review } = data;
  
    const newReview = new Review({
      movie: movieId,
      user: userId,
      rating: rating,
      comment: review,
    });
  
    const savedReview = await newReview.save();
  
    await Movie.findByIdAndUpdate(movieId, {
      $push: { reviews: savedReview._id },
    });
  
    return savedReview;
  }
  
  public async updateAverageRating(movieId: string) {
    const reviews = await Review.find({ movie: movieId });
  
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;
  
      await Movie.findByIdAndUpdate(movieId, { averageRating });
    } else {
      await Movie.findByIdAndUpdate(movieId, { averageRating: 0 });
    }
  }
  
}

export default new MovieService();
