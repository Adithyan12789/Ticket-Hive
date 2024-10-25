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
        const theaterOwner = await Theater.findById(decoded.id).select('-password');

        console.log('decoded: ', decoded);
        console.log('theaterOwner auth: ', theaterOwner);
        

        if (!theaterOwner || theaterOwner.isBlocked) {
          console.log('User is blocked or not found');
          res.clearCookie('jwtTheaterOwner', { path: '/theater' });
          res.status(401).json({ message: 'User is blocked or not authorized' });
          return;
        }

        req.theaterOwner = {
          _id: theaterOwner._id.toString(),
          isBlocked: theaterOwner.isBlocked ?? false
        };

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
