// config / IRepository.ts
import { ITheaterOwner } from "../../Models/TheaterOwnerModel";
import { IUser } from "../../Models/UserModel";
import { AdminLogin } from "../../types/adminTypes";

export interface IAdminRepository {
  authenticateAdmin(email: string, password: string): Promise<AdminLogin>;
  getAdminCredentials(): Promise<{ adminEmail: string; adminPassword: string }>;
  getAllUsers(): Promise<IUser[]>;
  getAllTheaterOwners(): Promise<ITheaterOwner[]>;
  updateUser(userId: string, userData: Partial<IUser>): Promise<IUser | null>;
  updatedTheaterOwner(theaterOwnerId: string, data: Partial<ITheaterOwner>): Promise<ITheaterOwner | null>;
  getPendingTheaterOwnerVerifications(): Promise<void>;
  findTheaterById(id: string): Promise<any>;
  saveTheater(theater: string): Promise<any>;
  findTheaterOwnerById(id: string): Promise<any>;
  getAllAdmins(): Promise<AdminLogin[]>;
  findAllBookings(): Promise<any>;
}
