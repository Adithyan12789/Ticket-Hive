import { Booking } from "../Models/bookingModel";
import User, { IUser } from "../Models/UserModel";

class UserRepository {
    public async findUserByEmail(email: string): Promise<IUser | null> {
        return await User.findOne({ email });
    }

    public async saveUser(userData: IUser): Promise<IUser> {
        const user = new User(userData);
        return await user.save();
    }

    public async findUserByResetToken(resetToken: string): Promise<IUser | null> {
        return await User.findOne({
            resetPasswordToken: resetToken,
            resetPasswordExpires: { $gt: Date.now() },
        });
    }

    public async updateUser(userId: string, updates: Partial<IUser>): Promise<IUser | null> {
        return await User.findByIdAndUpdate(userId, updates, { new: true });
    }

    public async findUserById(userId: string): Promise<IUser | null> {
        return await User.findById(userId);
    }

    public async findBookingsByUserId(userId: string): Promise<any[]> {
        return await Booking.find({ user: userId }).populate("movie theater screen").lean();
    }

    public async findBookingById(bookingId: string): Promise<any | null> {
        return await Booking.findById(bookingId).populate("movie theater screen").lean();
    }    

    public async deleteBookingById(bookingId: string): Promise<any | null> {
        return await Booking.findByIdAndDelete(bookingId);
    }
}

export default new UserRepository();
