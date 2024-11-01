import dotenv from "dotenv";
import User, { IUser } from "../Models/UserModel";
import TheaterOwner, { ITheaterOwner } from "../Models/TheaterOwnerModel";
import Theater from "../Models/TheaterDetailsModel";
import mongoose from "mongoose";

dotenv.config();

class AdminRepository {
  public static getAdminCredentials() {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      throw new Error("Admin credentials are not configured properly");
    }

    return { adminEmail, adminPassword };
  }

  public static async getAllUsers(): Promise<IUser[]> {
    try {
      return await User.find({}, { name: 1, email: 1, phone: 1, isBlocked: 1 });
    } catch (error) {
      console.error("Error fetching users:", error);
      throw new Error("Error fetching users");
    }
  }

  public static async getAllTheaterOwners(): Promise<ITheaterOwner[]> {
    try {
      return await TheaterOwner.find(
        {},
        { name: 1, email: 1, phone: 1, isBlocked: 1 }
      );
    } catch (error) {
      console.error("Error fetching theater owners:", error);
      throw new Error("Error fetching theater owners");
    }
  }

  public static async updateUser(
    userId: string,
    userData: Partial<IUser>
  ): Promise<IUser | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        console.error(`Invalid userId format: ${userId}`);
        throw new Error("Invalid userId format");
      }

      const user = await User.findById(userId);
      if (!user) throw new Error("User not found");

      Object.assign(user, userData);

      return await user.save();
    } catch (error: any) {
      console.error("Error in updateUser:", error);
      throw new Error(error.message);
    }
  }

  public static async updatedTheaterOwner(
    theaterOwnerId: string,
    theaterOwnerData: Partial<ITheaterOwner>
  ): Promise<ITheaterOwner | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(theaterOwnerId)) {
        console.error(`Invalid theaterOwnerId format: ${theaterOwnerId}`);
        throw new Error("Invalid theaterOwnerId format");
      }

      const theaterOwner = await TheaterOwner.findById(theaterOwnerId);
      if (!theaterOwner) throw new Error("Theater Owner not found");

      Object.assign(theaterOwner, theaterOwnerData);

      return await theaterOwner.save();
    } catch (error: any) {
      console.error("Error in updatedTheaterOwner:", error);
      throw new Error(error.message);
    }
  }

  public static async getPendingTheaterOwnerVerifications() {
    try {
      return await Theater.find({ verificationStatus: "pending" }).select(
        "-password"
      );
    } catch (error) {
      console.error("Error fetching pending theater verifications:", error);
      throw new Error("Error fetching pending theater verifications");
    }
  }

  public static async findTheaterOwnerById(id: string) {
    try {
      return await TheaterOwner.findById(id);
    } catch (error) {
      console.error(`Error finding Theater Owner with ID: ${id}`, error);
      throw new Error("Error finding Theater Owner");
    }
  }

  public static async findTheaterById(id: string) {
    try {
      return await Theater.findById(id);
    } catch (error) {
      console.error(`Error finding Theater with ID: ${id}`, error);
      throw new Error("Error finding Theater");
    }
  }

  public static async saveTheater(theater: any) {
    try {
      return await theater.save();
    } catch (error) {
      console.error("Error saving Theater:", error);
      throw new Error("Error saving Theater");
    }
  }
}

export default AdminRepository;
