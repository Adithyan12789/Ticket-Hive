import jwt from 'jsonwebtoken';
import expressAsyncHandler from 'express-async-handler';
import { Request, Response, NextFunction } from 'express';
import Theater from '../Models/TheaterOwnerModel';
import { JwtPayload } from 'jsonwebtoken';

interface CustomRequest extends Request {
  theaterOwner?: {
    _id: string;
    isBlocked: boolean;
  } | null;
}

class TheaterAuthMiddleware {
  static protect = expressAsyncHandler(async (req: CustomRequest, res: Response, next: NextFunction) => {
    const token: string | undefined = req.cookies?.theaterOwnerJwt;

    if (!token) {
      res.status(401).json({ message: 'Not authorized, no token provided' });
      return; // Ensure we exit the function early
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_THEATER as string) as JwtPayload;
      const theaterOwner = await Theater.findById(decoded.id).select('-password');

      if (!theaterOwner) {
        res.clearCookie('jwtTheaterOwner', { path: '/theater' });
        res.status(401).json({ message: 'Theater owner not found' });
        return;
      }

      if (theaterOwner.isBlocked) {
        res.clearCookie('jwtTheaterOwner', { path: '/theater' });
        res.status(403).json({ message: 'Theater owner is blocked' });
        return;
      }

      req.theaterOwner = {
        _id: theaterOwner._id.toString(),
        isBlocked: theaterOwner.isBlocked ?? false,
      };

      next(); // Proceed to the next middleware
    } catch (error) {
      res.status(401).json({ message: 'Invalid or expired token' });
    }
  });
}

export { TheaterAuthMiddleware, CustomRequest };
