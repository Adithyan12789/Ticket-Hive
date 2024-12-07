import asyncHandler from "express-async-handler";
import UserService from "../Services/UserService";
import EmailUtil from "../Utils/EmailUtil";
import User from "../Models/UserModel";
import TokenService from "../Utils/GenerateToken";
import { Request, Response, NextFunction } from "express";
import { IUser } from "../Models/UserModel";
import { CustomRequest } from "../Middlewares/AuthMiddleware";
import { Movie } from "../Models/MoviesModel";
import { Booking } from "../Models/bookingModel";

class UserController {

  refreshToken = async (req: Request, res: Response) => {
    // Log to check if cookies are being sent
    console.log("Request Cookies:", req.cookies);

    const refreshToken = req.cookies["refreshToken"]; // Ensure it's the correct name

    // Check if refresh token exists
    if (!refreshToken) {
      res.status(401).json({ message: "No refresh token provided" });
      return;
    }

    // Verify the refresh token using TokenService
    const decoded = TokenService.verifyRefreshToken(refreshToken);

    // Log to check the decoded token (this will give you insights if it's null or malformed)
    console.log("Decoded Token:", decoded);

    if (!decoded || typeof decoded === "string") {
      res.status(401).json({ message: "Invalid or expired refresh token" });
      return;
    }

    // Find the user using the userId from the decoded token
    try {
      const user = await User.findById(decoded.userId);

      // Log user object to ensure it's being fetched
      console.log("Found User:", user);

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      // Generate new access token
      const newAccessToken = TokenService.generateAccessToken(
        user._id.toString()
      );

      // Set the new access token in cookies
      res.cookie("jwt_access", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.status(200).json({ message: "Token refreshed successfully" });
    } catch (error) {
      // Handle errors during user lookup (database issues, etc.)
      console.error("Error finding user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  authUser = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ message: "Email and password are required" });
        return;
      }

      try {
        const user = await UserService.authenticateUser(email, password);

        const accessToken = TokenService.generateAccessToken(
          user._id.toString()
        );

        console.log("controller accessToken: ", accessToken);
        
        const refreshToken = TokenService.generateRefreshToken(
          user._id.toString()
        );

        const test = TokenService.setTokenCookies(res, accessToken, refreshToken);
        console.log("test: ", test);
        

        // Send tokens along with the user data
        res.status(200).json({
          id: user._id,
          name: user.name,
          email: user.email,
          accessToken, // Add accessToken here
          refreshToken, // Add refreshToken here
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
          const accessToken = TokenService.generateAccessToken(
            user._id.toString()
          );
          const refreshToken = TokenService.generateRefreshToken(
            user._id.toString()
          );
  
          TokenService.setTokenCookies(res, accessToken, refreshToken);
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
            const accessToken = TokenService.generateAccessToken(
              user._id.toString()
            );
            const refreshToken = TokenService.generateRefreshToken(
              user._id.toString()
            );
    
            TokenService.setTokenCookies(res, accessToken, refreshToken);
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

        // If you want to log the user in after registration and send tokens
        if (!otpSent) {
          // Generate both access and refresh tokens for new user
          const accessToken = TokenService.generateAccessToken(
            user._id.toString()
          );
          const refreshToken = TokenService.generateRefreshToken(
            user._id.toString()
          );
  
          TokenService.setTokenCookies(res, accessToken, refreshToken);
        }

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

  saveLocationController = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      if (!req.user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const { city, latitude, longitude } = req.body;

      // Validate latitude and longitude
      if (latitude == null || longitude == null) {
        res
          .status(400)
          .json({ message: "Latitude and longitude are required" });
        return;
      }

      try {
        // Call the service to update the location
        const updatedUser = await UserService.updateLocation(
          req.user._id.toString(),
          city,
          latitude,
          longitude
        );

        if (!updatedUser) {
          res.status(404).json({ message: "User not found" });
          return;
        }

        res.status(200).json({
          message: "Location updated successfully",
          latitude: updatedUser.latitude,
          longitude: updatedUser.longitude,
        });
      } catch (err) {
        res
          .status(500)
          .json({ message: "An error occurred while saving location" });
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
  
        const fileData = req.file
          ? { filename: req.file.filename }
          : { filename: undefined };
  
        // If password is being changed, validate currentPassword
        if (updateData.password) {
          if (!updateData.currentPassword) {
            res.status(400).json({ message: "Current password is required" });
            return;
          }
        }
  
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
  

  getOffersByTheaterId = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { theaterId } = req.params;
      const userId = req.user?._id;

      try {
        const offers = await UserService.getOffersByTheaterIdService(theaterId);
        if (!offers || offers.length === 0) {
          res.status(404).json({ message: "Offers not found" });
          return;
        }

        const bookings = await Booking.find({ user: userId })
          .select("offer")
          .exec();

        const usedOfferIds = bookings
          .map((booking) => booking.offer?.toString())
          .filter((offerId): offerId is string => !!offerId);

        const filteredOffers = offers.filter(
          (offer) => !usedOfferIds.includes(offer.id.toString())
        );

        res.status(200).json(filteredOffers);
      } catch (error: any) {
        res
          .status(500)
          .json({ message: error?.message || "Internal server error" });
      }
    }
  );

  logoutUser = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      // Optionally, you can perform any other cleanup actions related to the user session here
      await UserService.logoutUserService();

      // Clear the access token cookie (jwt)
      res.cookie("jwt", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: "strict",
        expires: new Date(0), // Expire the cookie immediately
      });

      // Clear the refresh token cookie
      res.cookie("refreshToken", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: "strict",
        expires: new Date(0), // Expire the cookie immediately
      });

      res.status(200).json({ message: "User Logged out" });
    }
  );
}

export default new UserController();
