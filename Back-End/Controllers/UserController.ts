import asyncHandler from "express-async-handler";
import UserService from "../Services/UserService";
import EmailUtil from "../Utils/EmailUtil";
import User from "../Models/UserModel";
import TokenService from "../Utils/GenerateToken";
import { Request, Response, NextFunction } from "express";
import { IUser } from "../Models/UserModel";
import { CustomRequest } from "../Middlewares/AuthMiddleware";
import { parse, format } from "date-fns";
import { Movie } from "../Models/MoviesModel";

class UserController {
  authUser = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ message: "Email and password are required" });
        return;
      }

      try {
        const user = await UserService.authenticateUser(email, password);

        TokenService.generateToken(res, user._id.toString());

        res.status(200).json({
          id: user._id,
          name: user.name,
          email: user.email,
        });
      } catch (err: unknown) {
        if (err instanceof Error) {
          if (err.message === "Your account is blocked") {
            res.status(401).json({
              message: "Your account is blocked. Please contact support.",
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

  googleLogin = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { googleName: name, googleEmail: email } = req.body;

      if (!email || !name) {
        res.status(400).json({ message: "Google Name and Email are required" });
        return;
      }

      try {
        let user = await User.findOne({ email });

        if (user) {
          TokenService.generateToken(res, user._id.toString());
          res.status(200).json({
            success: true,
            data: {
              _id: user._id,
              name: user.name,
              email: user.email,
            },
          });
        } else {
          user = await User.create({
            name,
            email,
            otp: "",
            phone: "",
            password: "",
          });
          if (user) {
            TokenService.generateToken(res, user._id.toString());
            res.status(201).json({
              success: true,
              data: {
                _id: user._id,
                name: user.name,
                email: user.email,
              },
            });
          } else {
            res.status(400).json({ message: "Invalid user data" });
          }
        }
      } catch (error: any) {
        res
          .status(500)
          .json({ message: "Internal server error", error: error.message });
      }
    }
  );

  registerUser = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { name, email, password, phone } = req.body;

      try {
        const user = await UserService.registerUserService(
          name,
          email,
          password,
          phone
        );
        const otpSent = !user.otpVerified;
        res.status(201).json({
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          otpSent,
          message: otpSent
            ? "User registered successfully. OTP sent."
            : "User already registered but OTP not verified.",
        });
      } catch (err: unknown) {
        if (err instanceof Error) {
          if (err.message === "Email already exists.") {
            res
              .status(400)
              .json({ message: "User with this email already exists" });
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

  verifyOTP = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { email, otp } = req.body;

      try {
        await UserService.verifyOtpService(email, otp);
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

  resendOtp = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { email } = req.body;

      try {
        await UserService.resendOtpService(email);
        res.status(200).json({ message: "OTP resent successfully" });
      } catch (err: unknown) {
        if (err instanceof Error && err.message === "User not found") {
          res.status(404).json({ message: "User with this email not found" });
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

  forgotPassword = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({ message: "Email is required" });
        return;
      }

      try {
        const resetToken = await UserService.forgotPasswordService(email);
        const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
        const message = `Password reset link: ${resetUrl}`;

        await EmailUtil.sendOtpEmail(email, message);
        res.status(200).json({ message: "Password reset email sent" });
      } catch (err: unknown) {
        if (err instanceof Error && err.message === "User not found") {
          res.status(404).json({ message: "User with this email not found" });
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

  resetPassword = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { password } = req.body;
      const resetToken = req.params.token;

      if (!resetToken || !password) {
        res.status(400).json({ message: "Token and password are required" });
        return;
      }

      try {
        await UserService.resetPasswordService(resetToken, password);
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

  getUserProfile = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      if (!req.user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const user = await UserService.getUserProfile(req.user._id);
      res.status(200).json(user);
    }
  );

  updateUserProfile = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      if (!req.user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      try {
        const updateData = { ...req.body };

        console.log("updateData: ", updateData);

        const fileData = req.file
          ? { filename: req.file.filename }
          : { filename: undefined };

        const updatedUser = await UserService.updateUserProfileService(
          req.user._id,
          updateData,
          fileData
        );

        res.status(200).json({
          _id: updatedUser._id,
          name: updatedUser.name,
          phone: updatedUser.phone,
          profileImageName: updatedUser.profileImageName,
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

  createBooking = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const {
        movieId,
        theaterId,
        screenId,
        seatIds,
        showTime,
        userId,
        totalPrice,
        paymentStatus,
        paymentMethod,
        convenienceFee,
        bookingDate,
      } = req.body;

      console.log("Raw bookingDate: ", bookingDate);
      console.log("payment Method: ", paymentMethod);
      console.log("showTime: ", showTime);

      let formattedBookingDate: Date;
      try {
        // Parse and format bookingDate as a Date object
        const parsedDate = parse(bookingDate, "EEEE dd MMM yyyy", new Date());
        if (isNaN(parsedDate.getTime())) {
          throw new Error("Invalid date");
        }
        formattedBookingDate = parsedDate; // Successfully parsed to Date
      } catch (error) {
        console.error("Error parsing bookingDate:", error);
        res.status(400).json({ message: "Invalid bookingDate format" });
        return;
      }

      console.log("Formatted bookingDate: ", formattedBookingDate);
      console.log("user id: ", userId);

      // Validate input data
      if (
        !movieId ||
        !theaterId ||
        !screenId ||
        !seatIds ||
        !showTime ||
        !userId ||
        !totalPrice ||
        !paymentStatus ||
        !convenienceFee ||
        !formattedBookingDate
      ) {
        res.status(400).json({ message: "Missing required fields" });
        return;
      }

      try {
        // Call the service method to create a booking
        const booking = await UserService.createBookingService(
          movieId,
          theaterId,
          screenId,
          seatIds,
          userId,
          totalPrice,
          showTime,
          paymentStatus,
          paymentMethod,
          convenienceFee,
          formattedBookingDate
        );

        console.log("controller booking: ", booking);

        res.status(201).json({
          message: "Booking successful",
          booking,
        });
      } catch (err: unknown) {
        if (err instanceof Error) {
          res.status(500).json({
            message: "An error occurred during booking",
            error: err.message,
          });
        } else {
          res.status(500).json({ message: "An unexpected error occurred" });
        }
      }
    }
  );

  getAllTickets = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      console.log("hi");

      const { userId } = req.params;
      console.log("userId: ", userId);

      if (!userId) {
        res.status(400).json({ message: "User ID is required" });
        return;
      }

      try {
        const tickets = await UserService.getAllTicketsService(userId);

        console.log("controller tickets: ", tickets);
        
        if (!tickets || tickets.length === 0) {
          res.status(404).json({ message: "No tickets found for this user" });
          return;
        }

        // Fetch movie details for each ticket
        const ticketsWithMovieDetails = await Promise.all(
          tickets.map(async (ticket) => {
            const movie = await Movie.findById(ticket.movieId).exec();
            return {
              ticket, // Original ticket details
              movieDetails: movie
                ? {
                    title: movie.title,
                    poster: movie.posters,
                    duration: movie.duration,
                    genre: movie.genres,
                  }
                : null, // Include movie details if found
            };
          })
        );

        res.status(200).json({
          success: true,
          tickets: ticketsWithMovieDetails,
        });
      } catch (error: unknown) {
        res.status(500).json({
          success: false,
          message: "Failed to retrieve tickets",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );

  cancelTicket = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { bookingId } = req.params;
      const userId = req.user?._id;

      if (!bookingId || !userId) {
        res
          .status(400)
          .json({ message: "Booking ID and User ID are required" });
        return;
      }

      try {
        const cancellationResult = await UserService.cancelTicketService(
          bookingId,
          userId
        );

        res.status(200).json({
          success: true,
          message: "Booking canceled successfully",
          booking: cancellationResult,
        });
      } catch (error: unknown) {
        res.status(500).json({
          success: false,
          message: "Failed to cancel booking",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );

  logoutUser = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      await UserService.logoutUserService();
      res.cookie("jwt", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: "strict",
        expires: new Date(0),
      });
      res.status(200).json({ message: "User Logged out" });
    }
  );
}

export default new UserController();
