import bcrypt from "bcryptjs";
import crypto from "crypto";
import TheaterRepository from "../Repositories/TheaterRepo";
import EmailUtil from "../Utils/EmailUtil";
import TheaterOwner from "../Models/TheaterOwnerModel";
import { ITheaterDetails } from "../Models/TheaterDetailsModel";
  
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

        // Check if OTP has expired
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

    public getTheaterOwnerProfile = async (theaterOwnerId: any) => {
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
          profileImageName:theaterOwner.profileImageName
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


    public addTheaterService = async (theaterId: string, theaterData: Partial<ITheaterDetails>) => {
        const createdTheater = await TheaterRepository.createTheater(theaterId, theaterData);
        return { status: 201, data: createdTheater };
    };


    public logoutTheaterOwnerService() {
        return true;
    }
}

export default new TheaterOwnerService();
