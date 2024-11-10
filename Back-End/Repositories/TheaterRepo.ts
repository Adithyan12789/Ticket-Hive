import { Movie } from "../Models/MoviesModel";
import TheaterDetails, { ITheaterDetails } from "../Models/TheaterDetailsModel";
import TheaterOwner, { ITheaterOwner } from "../Models/TheaterOwnerModel";

class TheaterRepository {

    public async findTheaterOwnerById(theaterOwnerId: string): Promise<ITheaterOwner | null> {
        return await TheaterOwner.findById(theaterOwnerId);
    }
    
    public async findTheaterById(theaterId: string): Promise<ITheaterDetails | null> {
        return await TheaterDetails.findById(theaterId);
    }

    public async findTheaterOwnerByEmail(email: string): Promise<ITheaterOwner | null> {
        return await TheaterOwner.findOne({ email });
    }

    public async saveTheaterOwner(theaterOwnerData: ITheaterOwner): Promise<ITheaterOwner> {
        const theater = new TheaterOwner(theaterOwnerData);
        return await theater.save();
    }

    public async findTheaterOwnerByResetToken(resetToken: string): Promise<ITheaterOwner | null> {
        return await TheaterOwner.findOne({
            resetPasswordToken: resetToken,
            resetPasswordExpires: { $gt: Date.now() },
        });
    }

    public createTheater = async (theaterId: string, theaterData: Partial<ITheaterDetails>) => {
        const theater = new TheaterDetails({ ...theaterData, theaterId });
        return await theater.save();
    };

    public async getAllTheaters(): Promise<ITheaterDetails[]> {
        try {
            const theaters = await TheaterDetails.find({});
            return theaters;
        } catch (error) {
            throw new Error("Error fetching theater owners");
        }
    }    

    public async updateTheaterOwner(theaterOwnerId: string, updates: Partial<ITheaterOwner>): Promise<ITheaterOwner | null> {
        return await TheaterOwner.findByIdAndUpdate(theaterOwnerId, updates, { new: true });
    }

    public async findTheatersByMovieTitle(movieTitle: string): Promise<ITheaterDetails[]> {
        try {
            const movie = await Movie.findOne({ title: movieTitle }).exec();
            if (!movie) {
                throw new Error('Movie not found');
            }
    
            const theaters = await TheaterDetails.find({ movies: movie._id }).exec();
            return theaters;
        } catch (error) {
            throw new Error("Error fetching theater by movie name");
        }
    }
    
}

export default new TheaterRepository();
