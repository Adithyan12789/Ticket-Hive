import Theater, { ITheater } from "../Models/TheaterModel";

export const findTheaterOwnerByEmail = async (email: string) => {
    return await Theater.findOne({ email });
};

export const saveTheaterOwner = async (theaterOwnerData: ITheater) => {
    const theater = new Theater(theaterOwnerData);
    return await theater.save();
};

export const findTheaterOwnerByResetToken = async (resetToken: string) => {
    return await Theater.findOne({
        resetPasswordToken: resetToken,
        resetPasswordExpires: { $gt: Date.now() },
    });
};

export const updateTheaterOwner = async (theaterOwnerId: string, updates: object) => {
    return await Theater.findByIdAndUpdate(theaterOwnerId, updates, { new: true });
};
