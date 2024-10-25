import TheaterDetails, { ITheaterDetails } from "../Models/TheaterDetailsModel";
import TheaterOwner, { ITheaterOwner } from "../Models/TheaterOwnerModel";

class TheaterRepository {

    public async findTheaterOwnerById(theaterOwnerId: string): Promise<ITheaterOwner | null> {
        return await TheaterOwner.findById(theaterOwnerId);
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

    public async updateTheaterOwner(theaterOwnerId: string, updates: Partial<ITheaterOwner>): Promise<ITheaterOwner | null> {
        return await TheaterOwner.findByIdAndUpdate(theaterOwnerId, updates, { new: true });
    }
}

export default new TheaterRepository();
