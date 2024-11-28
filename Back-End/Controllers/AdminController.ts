import asyncHandler from "express-async-handler";
import { NextFunction, Request, Response } from "express";
import adminService from "../Services/AdminService";
import expressAsyncHandler from "express-async-handler";

class AdminController {
  adminLogin = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ message: "Email and password are required" });
        return;
      }

      try {
        const adminData = await adminService.adminLoginService(
          email,
          password,
          res
        );
        res.status(200).json(adminData);
      } catch (error: any) {
        res.status(400).json({ message: error.message });
      }
    }
  );

  getAllUsers = expressAsyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const users = await adminService.getAllUsers();
      res.status(200).json(users);
    }
  );

  getAllTheaterOwners = expressAsyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const theaterOwners = await adminService.getAllTheaterOwners();
      res.status(200).json(theaterOwners);
    }
  );

  blockUserController = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const user = await adminService.blockUser(req);

        if (user) {
          res.status(200).json({ message: "User blocked successfully", user });
        } else {
          res.status(404).json({ message: "User not found" });
        }
      } catch (error) {
        console.error("Error blocking user:", error);
        res.status(500).json({ message: "Error blocking user" });
      }
    }
  );

  unblockUserController = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const user = await adminService.unblockUser(req);

        if (user) {
          res
            .status(200)
            .json({ message: "User unblocked successfully", user });
        } else {
          res.status(404).json({ message: "User not found" });
        }
      } catch (error) {
        console.error("Error unblocking user:", error);
        res.status(500).json({ message: "Error unblocking user" });
      }
    }
  );

  blockTheaterOwnerController = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const theaterOwner = await adminService.blockTheaterOwner(req);

        if (theaterOwner) {
          res.status(200).json({
            message: "Theater Owner blocked successfully",
            theaterOwner,
          });
        } else {
          res.status(404).json({ message: "Theater Owner not found" });
        }
      } catch (error) {
        console.error("Error blocking theater owner:", error);
        res.status(500).json({ message: "Error blocking theater owner" });
      }
    }
  );

  unblockTheaterOwnerController = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const theaterOwner = await adminService.unblockTheaterOwner(req);

        if (theaterOwner) {
          res.status(200).json({
            message: "Theater Owner unblocked successfully",
            theaterOwner,
          });
        } else {
          res.status(404).json({ message: "Theater Owner not found" });
        }
      } catch (error) {
        console.error("Error unblocking theater owner:", error);
        res.status(500).json({ message: "Error unblocking theater owner" });
      }
    }
  );

  getVerificationDetails = expressAsyncHandler(async (req, res) => {
    const theaters = await adminService.getVerificationDetails();
    res.status(200).json(theaters);
  });

  acceptVerification = expressAsyncHandler(async (req, res) => {
    try {
      await adminService.acceptVerification(req.params.theaterId);
      res.json({ message: "Verification accepted" });
    } catch (error) {
      console.error("Error accepting verification:", error);
      res.status(500).json({ message: "Server Error" });
    }
  });

  rejectVerification = expressAsyncHandler(async (req, res) => {
    try {
      const { adminId } = req.params;
      const { reason } = req.body;

      await adminService.rejectVerification(adminId, reason);
      res.json({ message: "Verification rejected" });
    } catch (error) {
      console.error("Error rejecting verification:", error);
      res.status(500).json({ message: "Server Error" });
    }
  });

  adminLogout = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const result = adminService.adminLogoutService(res);
      res.status(200).json(result);
    }
  );
}

export default new AdminController();
