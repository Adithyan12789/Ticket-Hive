import mongoose, { Types } from "mongoose";
import AdminRepository from "../Repositories/AdminRepo";
import AdminTokenService from "../Utils/GenerateAdminToken";
import { Request, Response } from "express";
import nodemailer from "nodemailer";
import Admin from "../Models/AdminModel";
import { inject, injectable } from "inversify";
import { IAdminRepository } from "../Interface/IAdmin/IRepository";
import { AdminLogin } from "../types/adminTypes";
import { IUser } from "../Models/UserModel";
export interface BookingDetails {
  totalPrice: number;
  paymentStatus: string;
  paymentMethod: string;
  bookingDate: Date;
  movie: any;
  screen: any;
  offer: any;
  _id: string;
  bookingId: string;
  user: { _id: string; name: string; email: string };
  theater: { _id: string; name: string; images: string[]; address: string };
  showTime: string;
  seats: string[];
  status: "pending" | "completed" | "cancelled" | "failed";
}

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "adithiruthiparambil12@gmail.com",
    pass: "phfa kacx ozkz ueig",
  },
});

@injectable()
export class AdminService {
  constructor(
    @inject("IAdminRepository") private adminRepository: IAdminRepository
  ) {}

  public async adminLoginService(
    email: string,
    password: string,
    res: Response
  ): Promise<AdminLogin> {
    // Authenticate admin credentials via the repository
    const { email: adminEmail, password: adminPassword } =
      await this.adminRepository.authenticateAdmin(email, password);

    let _id = "";
    let existingAdmin = await Admin.findOne({ email: adminEmail });

    // If admin does not exist, create a new admin
    if (!existingAdmin) {
      const newAdmin = new Admin({
        name: "Admin",
        email: adminEmail,
        password: adminPassword,
      });

      await newAdmin.save();
      existingAdmin = newAdmin;
    }

    _id = (existingAdmin._id as mongoose.Types.ObjectId).toString();
    const token = AdminTokenService.generateAdminToken(res, _id);

    return {
      _id,
      name: "Admin",
      email: adminEmail,
      token,
      isAdmin: true,
    };
  }

  public async getAllUsers() {
    return this.adminRepository.getAllUsers();
  }

  public async getAllTheaterOwners() {
    return await this.adminRepository.getAllTheaterOwners();
  }

  // AdminService.ts
  public async blockUser(userId: string): Promise<IUser | null> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid userId format");
    }

    const updatedUser = await this.adminRepository.updateUser(userId, {
      isBlocked: true,
    });

    if (!updatedUser) {
      throw new Error("User not found");
    }

    return updatedUser;
  }

  public async unblockUser(userId: string): Promise<any> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid userId format");
    }

    try {
      const updatedUser = await this.adminRepository.updateUser(userId, {
        isBlocked: false,
      });

      return updatedUser;
    } catch (error) {
      console.error(`Error updating user: ${error}`);
      throw new Error("Error updating user");
    }
  }

  public async blockTheaterOwner(theaterOwnerId: string): Promise<any> {
    if (!mongoose.Types.ObjectId.isValid(theaterOwnerId)) {
      throw new Error("Invalid theaterOwnerId format");
    }

    try {
      const updatedTheaterOwner =
        await this.adminRepository.updatedTheaterOwner(theaterOwnerId, {
          isBlocked: true,
        });

      return updatedTheaterOwner;
    } catch (error) {
      console.error(`Error updating theater Owner: ${error}`);
      throw new Error("Error updating theater Owner");
    }
  }

  public async unblockTheaterOwner(theaterOwnerId: string): Promise<any> {
    if (!mongoose.Types.ObjectId.isValid(theaterOwnerId)) {
      throw new Error("Invalid theaterOwnerId format");
    }

    try {
      const updatedTheaterOwner =
        await this.adminRepository.updatedTheaterOwner(theaterOwnerId, {
          isBlocked: false,
        });

      return updatedTheaterOwner;
    } catch (error) {
      console.error(`Error updating theater Owner: ${error}`);
      throw new Error("Error updating theater Owner");
    }
  }

  public async getVerificationDetails() {
    return await this.adminRepository.getPendingTheaterOwnerVerifications();
  }

  public async acceptVerification(
    theaterId: string
  ): Promise<{ message: string }> {
    const theater = await this.adminRepository.findTheaterById(theaterId);

    if (!theater) {
      throw new Error("Theater not found");
    }

    theater.verificationStatus = "accepted";
    theater.isVerified = true;
    await this.adminRepository.saveTheater(theater);

    const theaterOwner = await this.adminRepository.findTheaterOwnerById(
      theater.theaterOwnerId.toString()
    );
    if (!theaterOwner) {
      throw new Error("Theater Owner not found");
    }

    await this.sendVerificationEmail(
      theaterOwner.email,
      "Verification Accepted",
      "Your verification request has been accepted."
    );
    return { message: "Verification accepted and email sent." };
  }

  public async rejectVerification(
    theaterId: string,
    reason: string
  ): Promise<{ message: string }> {
    const theater = await this.adminRepository.findTheaterById(theaterId);
    if (!theater) {
      throw new Error("Theater not found");
    }

    theater.verificationStatus = "rejected";
    theater.isVerified = false;
    await this.adminRepository.saveTheater(theater);

    const theaterOwner = await this.adminRepository.findTheaterOwnerById(
      theater.theaterOwnerId.toString()
    );
    if (!theaterOwner) {
      throw new Error("Theater Owner not found");
    }

    const message = `Your verification request has been rejected for the following reason: ${reason}`;
    await this.sendVerificationEmail(
      theaterOwner.email,
      "Verification Rejected",
      message
    );
    return { message: "Verification rejected and email sent." };
  }

  public async getAllTicketsService() {
    const bookings = await this.adminRepository.findAllBookings();

    if (!bookings.length) throw new Error("No tickets found");

    return bookings.map((booking: BookingDetails) => ({
      bookingId: booking._id,
      userId: booking.user._id,
      userName: booking.user.name,
      userEmail: booking.user.email,
      screenId: booking.screen._id,
      movieId: booking.movie._id,
      offerId: booking.offer?._id,
      movieTitle: booking.movie.title,
      theaterName: booking.theater.name,
      images: booking.theater.images,
      address: booking.theater.address,
      screenName: booking.screen.screenNumber,
      seats: booking.seats,
      showTime: booking.showTime,
      bookingDate: booking.bookingDate,
      paymentStatus: booking.paymentStatus,
      paymentMethod: booking.paymentMethod,
      totalPrice: booking.totalPrice,
    }));
  }

  public async getAllAdmins() {
    let admins = await this.adminRepository.getAllAdmins();
    return admins;
  }

  public async adminLogoutService(res: Response) {
    res.cookie("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: new Date(0),
      sameSite: "strict",
    });
    return { message: "Admin logged out successfully" };
  }

  private async sendVerificationEmail(
    recipient: string,
    subject: string,
    message: string
  ) {
    try {
      await transporter.sendMail({
        from: "adithiruthiparambil12@gmail.com",
        to: recipient,
        subject: subject,
        text: message,
      });
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  }
}
