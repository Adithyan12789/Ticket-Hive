import bcrypt from "bcryptjs";
import crypto from "crypto";
import TheaterRepository from "../Repositories/TheaterRepo";
import EmailUtil from "../Utils/EmailUtil";
import TheaterOwner from "../Models/TheaterOwnerModel";
import TheaterDetails, { ITheaterDetails } from "../Models/TheaterDetailsModel";
import { Movie } from "../Models/MoviesModel";

class TheaterOwnerService {
    public async authTheaterOwnerService(email: string, password: string) {
        const theater = await TheaterRepository.findTheaterOwnerByEmail(email);

        if (theater && (await theater.matchPassword(password))) {
            if (theater.isBlocked) {
                throw new Error("Your account has been blocked");
            }
            return theater;
        }

        throw new Error("Invalid Email or Password");
    }

    public async registerTheaterOwnerService(
        name: string,
        email: string,
        password: string,
        phone: string
    ) {
        const existingTheaterOwner = await TheaterOwner.findOne({ email });

        if (existingTheaterOwner) {
            if (!existingTheaterOwner.otpVerified) {
                const otp = crypto.randomInt(100000, 999999).toString();
                existingTheaterOwner.otp = otp;
                existingTheaterOwner.otpVerified = false;
                existingTheaterOwner.otpGeneratedAt = new Date();
                await existingTheaterOwner.save();

                await EmailUtil.sendOtpEmail(existingTheaterOwner.email, otp);
                return existingTheaterOwner;
            }

            throw new Error('Email already exists.');
        }

        const otp = crypto.randomInt(100000, 999999).toString();

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newTheaterOwner = new TheaterOwner({
            name,
            email,
            phone,
            password: hashedPassword,
            otp,
            otpVerified: false,
        });

        await newTheaterOwner.save();
        await EmailUtil.sendOtpEmail(newTheaterOwner.email, otp);

        return newTheaterOwner;
    }

    public async verifyTheaterOwnerOtpService(email: string, otp: string) {
        const theater = await TheaterRepository.findTheaterOwnerByEmail(email);
        if (!theater) {
            throw new Error('Theater owner not found');
        }

        const OTP_EXPIRATION_TIME = 5 * 60 * 1000;

        if (new Date().getTime() - new Date(theater.otpGeneratedAt).getTime() > OTP_EXPIRATION_TIME) {
            throw new Error('OTP expired');
        }

        if (String(theater.otp) === String(otp)) {
            theater.otpVerified = true;
            await theater.save();
            return true;
        }
        throw new Error('Incorrect OTP');
    }

    public async resendTheaterOwnerOtpService(email: string) {
        const theater = await TheaterRepository.findTheaterOwnerByEmail(email);

        if (!theater) {
            throw new Error('User not found');
        }

        const otp = crypto.randomInt(100000, 999999).toString();

        theater.otp = otp;
        theater.otpExpires = new Date(Date.now() + 1 * 60 * 1000 + 59 * 1000);

        try {
            await TheaterRepository.saveTheaterOwner(theater);
        } catch (err) {
            throw new Error('Failed to save user with new OTP');
        }

        try {
            await EmailUtil.sendOtpEmail(theater.email, otp);
        } catch (err) {
            throw new Error('Failed to send OTP email');
        }

        return theater;
    }

    public async forgotTheaterOwnerPasswordService(email: string) {
        const theater = await TheaterRepository.findTheaterOwnerByEmail(email);
        if (!theater) {
            throw new Error('User not found');
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        theater.resetPasswordToken = resetToken;
        theater.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000);
        await theater.save();

        return resetToken;
    }

    public async resetTheaterOwnerPasswordService(resetToken: string, password: string) {
        const theater = await TheaterRepository.findTheaterOwnerByResetToken(resetToken);
        if (!theater) {
            throw new Error('Invalid or expired token');
        }

        const salt = await bcrypt.genSalt(10);
        theater.password = await bcrypt.hash(password, salt);
        theater.resetPasswordToken = undefined;
        theater.resetPasswordExpires = undefined;

        await theater.save();

        return true;
    }

    public getTheaterOwnerProfile = async (theaterOwnerId: string) => {
        const theaterOwner = await TheaterRepository.findTheaterOwnerById(theaterOwnerId);

        console.log("theaterOwner Service:", theaterOwner);

        if (!theaterOwner) {
            throw new Error('theater Owner not found');
        }

        return {
            _id: theaterOwner._id,
            name: theaterOwner.name,
            email: theaterOwner.email,
            phone: theaterOwner.phone,
            profileImageName: theaterOwner.profileImageName
        };
    };

    public updateTheaterOwnerProfileService = async (
        theaterOwnerId: string,
        updateData: { currentPassword: string; name: string; phone: string; password: string; },
        profileImage: { filename: string | undefined; }
    ) => {
        const theaterOwner = await TheaterRepository.findTheaterOwnerById(theaterOwnerId);
        if (!theaterOwner) {
            throw new Error("theater Owner not found");
        }

        if (updateData.currentPassword) {
            const isMatch = await theaterOwner.matchPassword(updateData.currentPassword);
            if (!isMatch) {
                throw new Error("Current password is incorrect");
            }
        }

        theaterOwner.name = updateData.name || theaterOwner.name;
        theaterOwner.phone = updateData.phone || theaterOwner.phone;

        if (updateData.password) {
            const salt = await bcrypt.genSalt(10);
            theaterOwner.password = await bcrypt.hash(updateData.password, salt);
        }

        if (profileImage) {
            theaterOwner.profileImageName = profileImage.filename || theaterOwner.profileImageName;
        }

        return await TheaterRepository.saveTheaterOwner(theaterOwner);
    };

    public uploadCertificates = async (theaterId: string, certificatePath: string) => {
        const theater = await TheaterRepository.findTheaterById(theaterId);
        if (!theater) {
          throw new Error('Theater not found');
        }
      
        theater.certificate = certificatePath.replace('Back-End/public/', '');
        theater.verificationStatus="pending"
        return await theater.save();
      };


    public addTheaterService = async (theaterId: string, theaterData: Partial<ITheaterDetails>) => {
        const createdTheater = await TheaterRepository.createTheater(theaterId, theaterData);
        return { status: 201, data: createdTheater };
    };

    public async getAllTheaters() {
        return await TheaterRepository.getAllTheaters();
    }

    public async getTheaterById(theaterId: string) {
        try {
            const theater = await TheaterRepository.findTheaterById(theaterId);
            if (!theater) {
                return { status: 404, data: { message: 'Theater not found' } };
            }

            return { status: 200, data: theater.toObject() };
        } catch (error) {
            console.error('Error fetching theater details:', error);
            return { status: 500, data: { message: 'Server error' } };
        }
    }


    public async updateTheaterData(
        theaterId: any,
        updateData: Partial<ITheaterDetails>,
        files: any
    ) {
        try {
            const theater = await TheaterRepository.findTheaterById(theaterId);

            console.log("service theater: ", theater);
            
    
            if (!theater) {
                throw new Error("Theater not found");
            }
    
            theater.name = updateData.name || theater.name;
            theater.city = updateData.city || theater.city;
            theater.address = updateData.address || theater.address;
            theater.description = updateData.description || theater.description;
            theater.amenities = updateData.amenities
                ? updateData.amenities.map((item: string) => item.trim())
                : theater.amenities;
            theater.latitude = updateData.latitude || theater.latitude;
            theater.longitude = updateData.longitude || theater.longitude;
    
            if (files && files.length > 0) {
                const newImages = files.map((file: { path: string; }) => {
                    return file.path.split('\\').pop()?.split('/').pop();
                }).filter((image: string | undefined) => image !== undefined);
    
                theater.images = newImages;
            }
    
            if (Array.isArray(updateData.removeImages) && updateData.removeImages.length > 0) {
                theater.images = theater.images.filter(
                    (image: string) => !updateData.removeImages!.includes(image)
                );
            }
    
            const updatedTheater = await theater.save();
            console.log("service updated theater: ", updatedTheater);
            return updatedTheater;
        } catch (error) {
            throw error;
        }
    }
    

    public async deleteTheaterService(id: string): Promise<ITheaterDetails | null> {
        const deletedTheater = await TheaterDetails.findByIdAndDelete(id);
        return deletedTheater;
    }

    public getTheatersByMovieTitle = async (movieTitle: string) => {
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
    };

    public logoutTheaterOwnerService() {
        return true;
    }
}

    export default new TheaterOwnerService();
