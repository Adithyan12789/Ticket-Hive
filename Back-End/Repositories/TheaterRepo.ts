// repos/theaterOwnerRepo.ts

import TheaterOwner from '../Models/TheaterModel';

const findTheaterOwnerByEmail = async (email: string) => {
    return TheaterOwner.findOne({ email });
};

const createTheaterOwner = async (theaterOwnerData: any) => {
    const theaterOwner = new TheaterOwner(theaterOwnerData);
    await theaterOwner.save();
    return theaterOwner;
};

const updateTheaterOwner = async (id: string, updateData: any) => {
    return TheaterOwner.findByIdAndUpdate(id, updateData, { new: true });
};

const findTheaterOwnerByResetToken = async (resetToken: string) => {
    return TheaterOwner.findOne({ 
        resetPasswordToken: resetToken,
        resetPasswordExpires: { $gt: Date.now() }, // Token not expired
    });
};

export default {
    findTheaterOwnerByEmail,
    createTheaterOwner,
    updateTheaterOwner,
    findTheaterOwnerByResetToken,
};
