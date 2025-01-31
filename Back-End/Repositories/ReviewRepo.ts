import { injectable } from "inversify";
import { BaseRepository } from "./Base/BaseRepository";
import { IReview, Review } from "../Models/ReviewModel";
import { Movie } from "../Models/MoviesModel";

@injectable()
export class ReviewRepository
  extends BaseRepository<IReview>
  implements ReviewRepository
{
  constructor() {
    super(Review);
  }

  public async getAllReviews(): Promise<any> {
    return await Review.find({}).populate("user", "name").populate("movie", "title");
  }

  public async getReviewsByMovieId(movieId: string): Promise<any> {
    return await Review.find({ movie: movieId }).populate("user", "name email");
  }

  public async addReview(data: {
    movieId: string;
    userId: string;
    rating: number;
    review: string;
  }): Promise<IReview> {
    const { movieId, userId, rating, review } = data;

    const newReview = new Review({
      movie: movieId,
      user: userId,
      rating: rating,
      comment: review,
    });

    const savedReview = await newReview.save();

    // Add the review to the movie's reviews array
    await Movie.findByIdAndUpdate(movieId, {
      $push: { reviews: savedReview._id },
    });

    return savedReview;
  }

  public async updateAverageRating(movieId: string): Promise<void> {
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
