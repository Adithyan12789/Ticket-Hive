import bcrypt from "bcryptjs";
import crypto from "crypto";
import UserRepository from "../Repositories/UserRepo";
import EmailUtil from "../Utils/EmailUtil";
import User, { IUser } from "../Models/UserModel";
import Screens from "../Models/ScreensModel";
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
      profileImageName: user.profileImageName,
    };
  };

  public updateUserProfileService = async (
    userId: string,
    updateData: {
      currentPassword: string;
      name: string;
      phone: string;
      password: string;
    },
    profileImage: { filename: string | undefined }
  ) => {
    const user = await UserRepository.findUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (updateData.currentPassword) {
      const isMatch = await user.matchPassword(updateData.currentPassword);
      if (!isMatch) {
        throw new Error("Current password is incorrect");
      }
    }

    user.name = updateData.name || user.name;
    user.phone = updateData.phone || user.phone;

    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(updateData.password, salt);
    }

    if (profileImage) {
      user.profileImageName = profileImage.filename || user.profileImageName;
    }

    return await UserRepository.saveUser(user);
  };

  public async createBookingService(
    movieId: string,
    theaterId: string,
    screenId: string,
    seatIds: string[],
    userId: string,
    totalPrice: number,
    showTime: string,
    paymentStatus: string,
    paymentMethod: string,
    convenienceFee: number,
    formattedBookingDate: Date
  ) {
    console.log(
      "Received formattedBookingDate in service:",
      formattedBookingDate
    );
    console.log("screenId: ", screenId);

    console.log("showTime: ", showTime);
    

    // Create the booking object
    const newBooking = new Booking({
      movie: movieId,
      theater: theaterId,
      screen: screenId,
      seats: seatIds,
      bookingDate: formattedBookingDate,
      showTime,
      paymentStatus,
      paymentMethod: paymentMethod || "default",
      convenienceFee,
      user: userId,
      totalPrice,
    });

    console.log("new booking: ", newBooking);

    await newBooking.save();

    // Get the screen details
    const screen = await Screens.findById(screenId);
    console.log("serv screen: ", screen);

    // Find the specific show time for the booking
    const show = screen?.showTimes.find((s) => s.time === showTime);
    console.log("show: ", show);

    if (!show) {
      throw new Error("Show time not found");
    }

    console.log("after show: ", show);

    const updatedLayout = show.layout.map((row) =>
      row.map((seat) =>
        seatIds.includes(seat.label) ? { ...seat, isAvailable: false } : seat
      )
    );
    
    show.layout = updatedLayout;

    await screen?.save();
    console.log("Screen after update: ", screen);
    
    return newBooking;
  }

  public async getAllTicketsService(userId: string) {
    const user = await UserRepository.findUserById(userId);

    console.log("user service: ", user);

    const tickets = await UserRepository.findBookingsByUserId(userId);

    console.log("tickets service: ", tickets);

    if (!tickets.length) {
      throw new Error("No tickets found");
    }

    return tickets.map((booking) => ({
      bookingId: booking._id,
      screenId: booking.screen._id,
      movieId: booking.movie._id,
      movieTitle: booking.movie.title,
      theaterName: booking.theater.name,
      screenName: booking.screen.screenNumber,
      seats: booking.seats,
      showTime: booking.showTime,
      bookingDate: booking.bookingDate,
      paymentStatus: booking.paymentStatus,
      totalPrice: booking.totalPrice,
    }));
  }

  public async cancelTicketService(bookingId: string, userId: string) {
    const booking = await UserRepository.findBookingById(bookingId);

    if (!booking) {
      throw new Error("Booking not found");
    }

    if (String(booking.user) !== userId) {
      throw new Error("You are not authorized to cancel this ticket");
    }

    const CANCELLATION_WINDOW_HOURS = 24;
    const now = new Date();
    const showDate = new Date(booking.bookingDate);
    const timeDifference = showDate.getTime() - now.getTime();

    if (timeDifference < CANCELLATION_WINDOW_HOURS * 60 * 60 * 1000) {
      throw new Error(
        "Tickets cannot be canceled within 24 hours of the showtime"
      );
    }

    // Update booking status or delete
    await UserRepository.deleteBookingById(bookingId);

    return { message: "Booking canceled successfully" };
  }

  public logoutUserService() {
    return true;
  }
}

export default new UserService();
