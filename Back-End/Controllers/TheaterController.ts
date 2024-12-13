import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import TheaterOwnerService from "../Services/TheaterService";
import EmailUtil from "../Utils/EmailUtil";
import Theater from "../Models/TheaterOwnerModel";
import TheaterTokenService from "../Utils/GenerateTheaterToken";
import { CustomRequest } from "../Middlewares/TheaterAuthMiddleware";
import mongoose, { ObjectId } from "mongoose";
import TheaterDetails from "../Models/TheaterDetailsModel";
import { Movie } from "../Models/MoviesModel";
import { IScreen, Screens } from "../Models/ScreensModel";
import User from "../Models/UserModel";
import { Offer } from "../Models/OffersModel";
import { Booking } from "../Models/bookingModel";
import { ISchedule, Schedule } from "../Models/ScheduleModel";
import { Notification } from "../Models/NotificationModel";

class TheaterController {
  authTheaterOwner = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ message: "Email and password are required" });
        return;
      }

      try {
        const theater = await TheaterOwnerService.authTheaterOwnerService(
          email,
          password
        );

        TheaterTokenService.generateTheaterToken(res, theater._id.toString());

        res.status(200).json({
          id: theater._id,
          name: theater.name,
          email: theater.email,
        });
      } catch (err: unknown) {
        if (err instanceof Error) {
          if (err.message === "Your account has been blocked") {
            res.status(401).json({
              message: "Your account has been blocked. Please contact support.",
            });
          } else if (err.message === "Invalid Email or Password") {
            res.status(401).json({ message: "Invalid email or password" });
          } else {
            res
              .status(500)
              .json({ message: "An error occurred during authentication" });
          }
        } else {
          res
            .status(500)
            .json({ message: "An error occurred during authentication" });
        }
      }
    }
  );

  googleLoginTheaterOwner = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { googleName: name, googleEmail: email } = req.body;

      if (!email || !name) {
        res.status(400).json({ message: "Google Name and Email are required" });
        return;
      }

      try {
        let theaterOwner = await Theater.findOne({ email });

        if (theaterOwner) {
          TheaterTokenService.generateTheaterToken(
            res,
            theaterOwner._id.toString()
          );
          res.status(200).json({
            success: true,
            data: {
              _id: theaterOwner._id,
              name: theaterOwner.name,
              email: theaterOwner.email,
            },
          });
        } else {
          theaterOwner = await Theater.create({
            name,
            email,
            otp: "",
            phone: "",
            password: "",
          });

          if (theaterOwner) {
            TheaterTokenService.generateTheaterToken(
              res,
              theaterOwner._id.toString()
            );
            res.status(201).json({
              success: true,
              data: {
                _id: theaterOwner._id,
                name: theaterOwner.name,
                email: theaterOwner.email,
              },
            });
          } else {
            res.status(400).json({ message: "Invalid theater Owner data" });
          }
        }
      } catch (error: any) {
        console.error("Error in google Login:", error.message);
        res
          .status(500)
          .json({ message: "Internal server error", error: error.message });
      }
    }
  );

  registerTheaterOwner = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { name, email, password, phone } = req.body;

      try {
        const theater = await TheaterOwnerService.registerTheaterOwnerService(
          name,
          email,
          password,
          phone
        );

        const otpSent = !theater.otpVerified;

        res.status(201).json({
          id: theater._id.toString(),
          name: theater.name,
          email: theater.email,
          otpSent,
          message: otpSent
            ? "Theater Owner registered successfully. OTP sent."
            : "Theater Owner already registered but OTP not verified.",
        });
      } catch (err: unknown) {
        if (err instanceof Error) {
          if (err.message === "Email already exists.") {
            res.status(400).json({
              message: "Theater Owner with this email already exists",
            });
          } else if (err.message === "Email exists but OTP is not verified.") {
            res
              .status(400)
              .json({ message: "Email exists but OTP is not verified." });
          } else {
            res
              .status(500)
              .json({ message: "An error occurred during registration" });
          }
        } else {
          res.status(500).json({ message: "An unexpected error occurred" });
        }
      }
    }
  );

  verifyTheaterOwnerOTP = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { email, otp } = req.body;

      try {
        await TheaterOwnerService.verifyTheaterOwnerOtpService(email, otp);
        res.status(200).json({ message: "OTP verified successfully" });
      } catch (err: unknown) {
        if (err instanceof Error && err.message === "Incorrect OTP") {
          res.status(400).json({ message: "Incorrect OTP" });
        } else if (err instanceof Error && err.message === "OTP expired") {
          res
            .status(400)
            .json({ message: "OTP has expired. Please request a new one" });
        } else {
          res
            .status(500)
            .json({ message: "An error occurred during OTP verification" });
        }
      }
    }
  );

  resendTheaterOwnerOtp = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { email } = req.body;

      try {
        await TheaterOwnerService.resendTheaterOwnerOtpService(email);
        res.status(200).json({ message: "OTP resent successfully" });
      } catch (err: unknown) {
        if (err instanceof Error && err.message === "Theater Owner not found") {
          res
            .status(404)
            .json({ message: "Theater Owner with this email not found" });
        } else if (
          err instanceof Error &&
          err.message === "Failed to send OTP"
        ) {
          res
            .status(500)
            .json({ message: "Failed to resend OTP. Please try again" });
        } else {
          res.status(500).json({ message: "An unexpected error occurred" });
        }
      }
    }
  );

  forgotTheaterOwnerPassword = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({ message: "Email is required" });
        return;
      }

      try {
        const resetToken =
          await TheaterOwnerService.forgotTheaterOwnerPasswordService(email);
        const resetUrl = `http://localhost:3000/theater-reset-password/${resetToken}`;
        const message = `Password reset link: ${resetUrl}`;

        await EmailUtil.sendOtpEmail(email, message);
        res.status(200).json({ message: "Password reset email sent" });
      } catch (err: unknown) {
        if (err instanceof Error && err.message === "Theater Owner not found") {
          res
            .status(404)
            .json({ message: "Theater Owner with this email not found" });
        } else if (
          err instanceof Error &&
          err.message === "Failed to send email"
        ) {
          res
            .status(500)
            .json({ message: "Failed to send reset email. Please try again" });
        } else {
          res.status(500).json({
            message: "An error occurred during password reset request",
          });
        }
      }
    }
  );

  resetTheaterOwnerPassword = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { password } = req.body;
      const resetToken = req.params.token;

      if (!resetToken || !password) {
        res.status(400).json({ message: "Token and password are required" });
        return;
      }

      try {
        await TheaterOwnerService.resetTheaterOwnerPasswordService(
          resetToken,
          password
        );
        res.status(200).json({ message: "Password reset successfully" });
      } catch (err: unknown) {
        if (
          err instanceof Error &&
          err.message === "Invalid or expired token"
        ) {
          res.status(400).json({ message: "Invalid or expired token" });
        } else {
          res
            .status(500)
            .json({ message: "An error occurred during password reset" });
        }
      }
    }
  );

  getTheaterOwners = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const admins = await TheaterOwnerService.getAllTheaterOwners();

      res.status(200).json(admins);
    }
  );

  getTheaterProfile = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      if (!req.theaterOwner) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const theaterOwner = await TheaterOwnerService.getTheaterOwnerProfile(
        req.theaterOwner._id
      );

      res.status(200).json(theaterOwner);
    }
  );

  updateTheaterProfile = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      if (!req.theaterOwner) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      try {
        const updateData = { ...req.body };

        const fileData = req.file
          ? { filename: req.file.filename }
          : { filename: undefined };

        const updatedTheaterOwner =
          await TheaterOwnerService.updateTheaterOwnerProfileService(
            req.theaterOwner._id,
            updateData,
            fileData
          );

        res.status(200).json({
          _id: updatedTheaterOwner._id,
          name: updatedTheaterOwner.name,
          phone: updatedTheaterOwner.phone,
          profileImageName: updatedTheaterOwner.profileImageName,
        });
      } catch (err: unknown) {
        if (
          err instanceof Error &&
          err.message === "Current password is incorrect"
        ) {
          res.status(404).json({ message: "Current password is incorrect" });
        } else {
          res.status(500).json({
            message: "An error occurred",
          });
        }
      }
    }
  );

  uploadVerificationDetailsHandler = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const theaterId = req.params.theaterId;

      if (!req.file) {
        res.status(400).json({ message: "No file uploaded" });
        return;
      }

      const certificatePath = req.file.path
        .replace(/.*public[\\/]/, "")
        .replace(/\\/g, "/");

      try {
        await TheaterOwnerService.uploadCertificates(
          theaterId,
          certificatePath
        );
        res
          .status(200)
          .json({ message: "Verification details submitted successfully" });
      } catch (error: any) {
        res.status(404).json({ message: error.message });
      }
    }
  );

  addTheaterController = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const {
        name,
        city,
        address,
        showTimes,
        description,
        amenities,
        latitude,
        longitude,
        ticketPrice,
      } = req.body;

      if (
        !name ||
        !city ||
        !address ||
        !showTimes ||
        !description ||
        !latitude ||
        !longitude ||
        !ticketPrice
      ) {
        res.status(400).json({ message: "All fields are required" });
        return;
      }

      if (!req.theaterOwner || req.theaterOwner.isBlocked) {
        res.status(403).json({ message: "Access denied" });
        return;
      }

      const images: string[] = Array.isArray(req.files)
        ? req.files.map((file: Express.Multer.File) => {
            return file.filename;
          })
        : [];

      try {
        const showTimesArray = Array.isArray(showTimes)
          ? showTimes
          : [showTimes];

        const response = await TheaterOwnerService.addTheaterService(
          req.theaterOwner._id,
          {
            theaterOwnerId: new mongoose.Types.ObjectId(req.theaterOwner._id),
            name,
            city,
            address,
            showTimes: showTimesArray.map((time: string) => time.trim()),
            images,
            description,
            ticketPrice,
            amenities: amenities
              .split(",")
              .map((amenity: string) => amenity.trim()),
            latitude,
            longitude,
            isListed: true,
          }
        );
        res.status(response.status).json(response.data);
      } catch (error: any) {
        console.error("Error adding theater:", error);
        res
          .status(500)
          .json({ message: "An error occurred while adding the theater" });
      }
    }
  );

  getTheaters = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const theaters = await TheaterOwnerService.getAllTheaters();

      res.status(200).json(theaters);
    }
  );

  getTheaterByIdHandler = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const theaterId = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(theaterId)) {
        res.status(400).json({ message: "Invalid Theater ID" });
        return;
      }

      try {
        const theater = await TheaterDetails.findById(theaterId);

        if (!theater) {
          res.status(404).json({ message: "Theater not found" });
          return;
        }

        res.json(theater.toObject());
      } catch (error) {
        console.error("Error in handler:", error);
        res.status(500).json({ message: "Server error" });
      }
    }
  );

  updateTheaterHandler = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { id } = req.params;
      const updateData = req.body;

      try {
        const updatedTheater = await TheaterOwnerService.updateTheaterData(
          id,
          updateData,
          req.files
        );

        if (!updatedTheater) {
          res.status(404).json({ message: "Theater not found for updating" });
          return;
        }

        res.status(200).json(updatedTheater);
      } catch (error: any) {
        console.error("Error updating theater:", error);
        res
          .status(500)
          .json({ message: "Error updating theater", error: error.message });
      }
    }
  );

  deleteTheaterHandler = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { id } = req.params;

      try {
        const deletedTheater = await TheaterOwnerService.deleteTheaterService(
          id
        );

        if (!deletedTheater) {
          res.status(404).json({ message: "Theater not found for deletion" });
          return;
        }

        res
          .status(200)
          .json({ message: "Theater deleted successfully", deletedTheater });
      } catch (error: any) {
        console.error("Error deleting theater:", error);
        res
          .status(500)
          .json({ message: "Error deleting theater", error: error.message });
      }
    }
  );

  getTheatersByMovieTitle = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { movieTitle } = req.params;
      const { userId, date } = req.query;
  
      try {
        const user = await User.findById(userId).select("-password");
        if (!user) {
          res.status(404).json({ message: "User not found" });
          return;
        }
  
        let movie;
        if (mongoose.Types.ObjectId.isValid(movieTitle)) {
          movie = await Movie.findById(movieTitle);
        } else {
          movie = await Movie.findOne({ title: movieTitle });
        }
  
        if (!movie) {
          res.status(404).json({ message: "Movie not found" });
          return;
        }
  
        const screens = await Screens.find({
          schedule: { $exists: true, $ne: [] },
        })
          .populate({
            path: "theater",
            select:
              "name location amenities description ticketPrice owner address city longitude latitude",
          })
          .populate({
            path: "schedule",
            populate: {
              path: "showTimes.movie",
              select: "title",
            },
          });
  
        const screensWithMovie = screens.filter((screen) =>
          (screen.schedule as unknown as ISchedule[]).some((schedule) =>
            schedule.showTimes.some(
              (showTime) =>
                (showTime.movie as unknown as mongoose.Types.ObjectId).equals(
                  movie._id as mongoose.Types.ObjectId
                )
            )
          )
        );
  
        const theaters = screensWithMovie
          .map((screen) => screen.theater)
          .filter(
            (value, index, self) =>
              value &&
              self.findIndex(
                (t) => t._id.toString() === value._id.toString()
              ) === index
          );

        let filteredSchedules = await Schedule.find({
          screen: { $in: screensWithMovie.map((screen) => screen._id) },
          "showTimes.movie": movie._id,
        })
          .populate({ path: "screen", select: "screenNumber theater" })
          .populate({ path: "showTimes.movie", select: "title" });

        if (date && typeof date === "string") {
          const selectedDate = new Date(date);
          filteredSchedules = filteredSchedules.filter((schedule) =>
            schedule.showTimes.some((showTime) => {
              const showTimeDate = new Date(showTime.time);
              return (
                showTimeDate.getFullYear() === selectedDate.getFullYear() &&
                showTimeDate.getMonth() === selectedDate.getMonth() &&
                showTimeDate.getDate() === selectedDate.getDate()
              );
            })
          );
        }
  
        res.status(200).json({
          user,
          theaters,
          screens: screensWithMovie,
          schedules: filteredSchedules,
        });
      } catch (err: unknown) {
        if (err instanceof Error) {
          res.status(500).json({ message: "An error occurred", error: err.message });
        } else {
          res.status(500).json({ message: "An unexpected error occurred" });
        }
      }
    }
  );
  
  getStatsController = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { ownerId } = req.params;

        const theaters = await TheaterDetails.find({ theaterOwnerId: ownerId });

        const bookings = await Booking.find({
          theater: { $in: theaters.map((t) => t._id) },
        }).populate("user", "_id name email");

        const totalEarnings = bookings.reduce(
          (sum, booking) => sum + booking.totalPrice,
          0
        );

        const uniqueUsers = new Set(
          bookings.map((booking) => booking.user._id.toString())
        );

        const stats = {
          theaters: theaters.length,
          users: uniqueUsers.size, // Count of unique users
          bookings: bookings.length,
          totalEarnings,
        };

        res.status(200).json({ stats, theaters, bookings });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        res.status(500).json({ message: "Error fetching data", error: error });
      }
    }
  );

  addOfferController = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {

      const {
        ownerId,
        offerName,
        paymentMethod,
        offerDescription,
        discountValue,
        minPurchaseAmount,
        validityStart,
        validityEnd,
        applicableTheaters,
      } = req.body;

      if (
        !ownerId ||
        !offerName ||
        !paymentMethod ||
        !offerDescription ||
        !discountValue ||
        minPurchaseAmount === undefined ||
        !validityStart ||
        !validityEnd ||
        !Array.isArray(applicableTheaters) ||
        applicableTheaters.length === 0
      ) {
        res.status(400).json({ message: "All fields are required" });
        return;
      }

      try {
        const parsedValidityStart = new Date(validityStart);
        const parsedValidityEnd = new Date(validityEnd);

        const newOffer = new Offer({
          createdBy: ownerId,
          offerName,
          paymentMethod,
          description: offerDescription,
          discountValue,
          minPurchaseAmount,
          validityStart: parsedValidityStart,
          validityEnd: parsedValidityEnd,
          applicableTheaters,
        });

        const createdOffer = await newOffer.save();

        res.status(201).json({
          message: "Offer created successfully",
          offer: createdOffer,
        });
      } catch (error) {
        console.error("Error creating offer:", error);
        res.status(500).json({ message: "Server error. Please try again." });
      }
    }
  );

  updateOfferController = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { offerId } = req.params;
      const offerData = req.body;

      if (!offerId) {
        res.status(400).json({ message: "Offer ID is required" });
        return;
      }

      try {
        const updatedOffer = await TheaterOwnerService.updateOfferService(
          offerId,
          offerData
        );
        res.status(200).json({
          message: "Offer updated successfully",
          offer: updatedOffer,
        });
      } catch (error: any) {
        console.error("Error updating offer:", error);
        res
          .status(error.statusCode || 500)
          .json({ message: error.message || "Internal server error" });
      }
    }
  );

  deleteOfferController = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { offerId } = req.params;

      try {
        const deletedOffer = await TheaterOwnerService.deleteOfferHandler(
          offerId
        );

        if (!deletedOffer) {
          res.status(404).json({ message: "Offer not found for deletion" });
          return;
        }

        res
          .status(200)
          .json({ message: "Offer deleted successfully", deletedOffer });
      } catch (error: any) {
        console.error("Error deleting Offer:", error);
        res
          .status(500)
          .json({ message: "Error deleting Offer", error: error.message });
      }
    }
  );

  getOffersController = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        const offers = await Offer.find();

        res.status(200).json(offers);
      } catch (error) {
        console.error("Error fetching offers:", error);
        res.status(500).json({ message: "Server error. Please try again." });
      }
    }
  );

  getUnreadNotifications = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
    try {
      const theaterOwnerId = req.theaterOwner?._id;

      console.log("getUnreadNotifications theaterOwnerId: ", theaterOwnerId);

      const notifications = await Notification.find({ theaterOwnerId: theaterOwnerId, isRead: false }).sort({ createdAt: -1 }); 

      console.log("notifications: ", notifications);
      
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  })
  
  markNotificationAsRead = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      const notification = await Notification.findById(id);
      
      if (!notification) {
         res.status(404).json({ message: 'Notification not found' });
         return
      }
  
      if (notification.theaterOwnerId.toString() !== req.theaterOwner?._id.toString()) {
        res.status(401).json({ message: 'Not authorized' });
        return
      }
  
      notification.isRead = true;
      await notification.save();
      
      res.json({ message: 'Notification marked as read' });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  })

  logoutTheaterOwner = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      await TheaterOwnerService.logoutTheaterOwnerService();
      res.cookie("theaterOwnerJwt", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: "strict",
        expires: new Date(0),
      });
      res.status(200).json({ message: "Theater Owner Logged out" });
    }
  );
}

export default new TheaterController();
