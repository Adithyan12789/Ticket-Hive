import bcrypt from "bcryptjs";
import crypto from "crypto";
import UserRepository from "../Repositories/UserRepo";
import EmailUtil from "../Utils/EmailUtil";
import User, { IUser } from "../Models/UserModel";
import { Booking } from "../Models/bookingModel";
import { Movie } from "../Models/MoviesModel";
import TheaterDetails from "../Models/TheaterDetailsModel";

class UserService {
  public async authenticateUser(email: string, password: string) {
    const user = await UserRepository.findUserByEmail(email);

    if (user) {
      if (user.isBlocked) {
        throw new Error("Your account is blocked");
      }
      if (await user.matchPassword(password)) {
        return user;
      }
    }

    throw new Error("Invalid Email or Password");
  }

  public async registerUserService(
    name: string,
    email: string,
    password: string,
    phone: string
  ) {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (!existingUser.otpVerified) {
        const otp = crypto.randomInt(100000, 999999).toString();
        existingUser.otp = otp;
        existingUser.otpVerified = false;
        existingUser.otpGeneratedAt = new Date();
        await existingUser.save();

        await EmailUtil.sendOtpEmail(existingUser.email, otp);
        return existingUser;
      }

      throw new Error("Email already exists.");
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      otp,
      otpVerified: false,
    });

    await newUser.save();
    await EmailUtil.sendOtpEmail(newUser.email, otp);
    return newUser;
  }

  public async verifyOtpService(email: string, otp: string) {
    const user = await UserRepository.findUserByEmail(email);
    if (!user) {
      throw new Error("User not found");
    }

    const OTP_EXPIRATION_TIME = 5 * 60 * 1000;

    if (!user.otpGeneratedAt) {
      throw new Error("OTP generation time is missing");
    }

    const otpGeneratedAt = user.otpGeneratedAt || new Date(0);
    if (new Date().getTime() - otpGeneratedAt.getTime() > OTP_EXPIRATION_TIME) {
      throw new Error("OTP expired");
    }

    if (String(user.otp) === String(otp)) {
      user.otpVerified = true;
      await user.save();
      return true;
    }
    throw new Error("Incorrect OTP");
  }

  public async resendOtpService(email: string) {
    const user = await UserRepository.findUserByEmail(email);

    if (!user) {
      throw new Error("User not found");
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 1 * 60 * 1000 + 59 * 1000);

    try {
      await UserRepository.saveUser(user);
    } catch (err) {
      throw new Error("Failed to save user with new OTP");
    }

    try {
      await EmailUtil.sendOtpEmail(user.email, otp);
    } catch (err) {
      throw new Error("Failed to send OTP email");
    }

    return user;
  }

  public async forgotPasswordService(email: string) {
    const user = await UserRepository.findUserByEmail(email);
    if (!user) {
      throw new Error("User not found");
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000);
    await user.save();

    return resetToken;
  }

  public async resetPasswordService(resetToken: string, password: string) {
    const user = await UserRepository.findUserByResetToken(resetToken);
    if (!user) {
      throw new Error("Invalid or expired token");
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return true;
  }

  public async updateLocation(
    userId: string,
    city: string,
    latitude: number,
    longitude: number
  ): Promise<IUser | null> {
    try {
      // Call the repository method to update the location
      return await UserRepository.updateLocation(userId, city, latitude, longitude);
    } catch (error) {
      throw new Error("Service: Error updating location");
    }
  }

  public getUserProfile = async (userId: any) => {
    const user = await UserRepository.findUserById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      city: user.city,
      profileImageName: user.profileImageName,
    };
  };

  public updateUserProfileService = async (
    userId: string,
    updateData: {
      currentPassword?: string;  // Optional field
      name: string;
      phone: string;
      password?: string;  // Optional field
    },
    profileImage: { filename: string | undefined }
  ) => {
    const user = await UserRepository.findUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }
  
    // Only check current password if user is updating their password
    if (updateData.password && updateData.currentPassword) {
      const isMatch = await user.matchPassword(updateData.currentPassword);
      if (!isMatch) {
        throw new Error("Current password is incorrect");
      }
    }
  
    user.name = updateData.name || user.name;
    user.phone = updateData.phone || user.phone;
  
    // If a new password is provided, hash it
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(updateData.password, salt);
    }
  
    // If a new profile image is uploaded, update the image filename
    if (profileImage) {
      user.profileImageName = profileImage.filename || user.profileImageName;
    }
  
    return await UserRepository.saveUser(user);
  };
  

  public getOffersByTheaterIdService = async (theaterId: string) => {
    try {
      return await UserRepository.getOffersByTheaterId(theaterId);
    } catch (error) {
      throw new Error("Error fetching Offers");
    }
  };

  public logoutUserService() {
    return true;
  }
}

export default new UserService();
