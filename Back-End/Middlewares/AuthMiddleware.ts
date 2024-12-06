
import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import TokenService from "../Utils/GenerateToken";
import User from "../Models/UserModel";

interface CustomRequest extends Request {
  user?: {
    _id: string;
    isBlocked: boolean;
  };
}

const AuthMiddleware = asyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const accessToken = req.cookies?.accessToken;
    const refreshToken = req.cookies?.refreshToken;

    if (accessToken) {
      const decodedAccess = TokenService.verifyAccessToken(accessToken);
      if (decodedAccess) {

        const user = await User.findById(decodedAccess.userId).select(
          "-password"
        );

        if (!user) {
          res.status(401);
          throw new Error("User not found or no longer exists");
        }        

        req.user = {
          _id: user._id.toString(),
          isBlocked: user.isBlocked ?? false,
        };

        return next();
      }
    }
    if (refreshToken) {
      const decodedRefresh = TokenService.verifyRefreshToken(refreshToken);
      if (decodedRefresh) {
        const user = await User.findById(decodedRefresh.userId);

        if (user) {
          const newAccessToken = TokenService.generateAccessToken(
            user._id.toString()
          );

          TokenService.setTokenCookies(res, newAccessToken, refreshToken);

          req.user = {
            _id: user._id.toString(),
            isBlocked: user.isBlocked ?? false,
          };
          
          return next();
        }
      }
    }

    res.status(401);
    throw new Error("Not authorized, invalid or expired token");
  }
);

export { AuthMiddleware, CustomRequest };
