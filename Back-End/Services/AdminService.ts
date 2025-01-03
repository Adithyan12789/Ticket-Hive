import mongoose, { Types } from "mongoose";
import AdminRepository from "../Repositories/AdminRepo";
import AdminTokenService from "../Utils/GenerateAdminToken";
import { Request, Response } from "express";
import nodemailer from "nodemailer";
import Admin from "../Models/AdminModel";
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

class AdminService {
  public async adminLoginService(
    email: string,
    password: string,
    res: Response
  ) {

    const { adminEmail, adminPassword } = AdminRepository.getAdminCredentials();

    let _id = "";

    if (email === adminEmail && password === adminPassword) {
      // Check if admin already exists in the database
      const existingAdmin = await Admin.findOne({ email: adminEmail });

      _id = existingAdmin?._id as string;

      if (!existingAdmin) {
        // If no existing admin, add to the database
        const newAdmin = new Admin({
          name: "Admin",
          email: adminEmail,
          password: adminPassword,
        });

        _id = newAdmin._id as string;

        await newAdmin.save();
      }

      const token = AdminTokenService.generateAdminToken(res, _id);

      return {
        _id: existingAdmin?._id,
        name: "Admin",
        email: adminEmail,
        token: token,
        isAdmin: true,
      };
    }

    throw new Error("Invalid Admin Email or Password");
  }

  public async getAllUsers() {
    return await AdminRepository.getAllUsers();
  }

  public async getAllTheaterOwners() {
    return await AdminRepository.getAllTheaterOwners();
  }

  public async blockUser(req: Request): Promise<any> {
    const userId = req.body.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid userId format");
    }

    try {
      const updatedUser = await AdminRepository.updateUser(userId, {
        isBlocked: true,
      });

      return updatedUser;
    } catch (error) {
      console.error(`Error updating user: ${error}`);
      throw new Error("Error updating user");
    }
  }

  public async unblockUser(req: Request): Promise<any> {
    const userId = req.body.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid userId format");
    }

    try {
      const updatedUser = await AdminRepository.updateUser(userId, {
        isBlocked: false,
      });

      return updatedUser;
    } catch (error) {
      console.error(`Error updating user: ${error}`);
      throw new Error("Error updating user");
    }
  }

  public async blockTheaterOwner(req: Request): Promise<any> {
    const theaterOwnerId = req.body.theaterOwnerId;

    if (!mongoose.Types.ObjectId.isValid(theaterOwnerId)) {
      throw new Error("Invalid theaterOwnerId format");
    }

    try {
      const updatedTheaterOwner = await AdminRepository.updatedTheaterOwner(
        theaterOwnerId,
        { isBlocked: true }
      );

      return updatedTheaterOwner;
    } catch (error) {
      console.error(`Error updating theater Owner: ${error}`);
      throw new Error("Error updating theater Owner");
    }
  }

  public async unblockTheaterOwner(req: Request): Promise<any> {
    const theaterOwnerId = req.body.theaterOwnerId;

    if (!mongoose.Types.ObjectId.isValid(theaterOwnerId)) {
      throw new Error("Invalid theaterOwnerId format");
    }

    try {
      const updatedTheaterOwner = await AdminRepository.updatedTheaterOwner(
        theaterOwnerId,
        { isBlocked: false }
      );

      return updatedTheaterOwner;
    } catch (error) {
      console.error(`Error updating theater Owner: ${error}`);
      throw new Error("Error updating theater Owner");
    }
  }

  public async getVerificationDetails() {
    return await AdminRepository.getPendingTheaterOwnerVerifications();
  }

  public async acceptVerification(theaterId: string) {
    const theater = await AdminRepository.findTheaterById(theaterId);
    if (!theater) {
      throw new Error("Theater not found");
    }

    theater.verificationStatus = "accepted";
    theater.isVerified = true;
    await AdminRepository.saveTheater(theater);

    const theaterOwner = await AdminRepository.findTheaterOwnerById(
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

  public async rejectVerification(theaterId: string, reason: string) {
    const theater = await AdminRepository.findTheaterById(theaterId);
    if (!theater) {
      throw new Error("Theater not found");
    }

    theater.verificationStatus = "rejected";
    theater.isVerified = false;
    await AdminRepository.saveTheater(theater);

    const theaterOwner = await AdminRepository.findTheaterOwnerById(
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
    const bookings = await AdminRepository.findAllBookings();

    console.log("getAllTicketsService bookings: ", bookings);

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
    let admins = await AdminRepository.getAllAdmins();
    return admins;
  }

  public adminLogoutService(res: Response) {
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

export default new AdminService();
