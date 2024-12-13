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
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_THEATER as string) as JwtPayload;
        const theaterOwner = await Theater.findById(decoded.id).select('-password')

        if (!theaterOwner || theaterOwner.isBlocked) {

          res.clearCookie('jwtTheaterOwner', { path: '/theater' });
          res.status(401).json({ message: 'Theater owner is blocked or not authorized' });
          return;
        }

        req.theaterOwner = {
          _id: theaterOwner._id.toString(),
          isBlocked: theaterOwner.isBlocked ?? false
        };

        if (!req.theaterOwner) {
          throw new Error("Theater owner not found.");
        }

        next();
      } catch (error) {
        res.status(401);
        throw new Error('Not authorized, invalid token');
      }
    } else {
      res.status(401);
      throw new Error('Not authorized, no token');
    }
  });
}

export { TheaterAuthMiddleware,  CustomRequest};
