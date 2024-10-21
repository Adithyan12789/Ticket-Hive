import jwt from 'jsonwebtoken';
import expressAsyncHandler from 'express-async-handler';
import { Request, Response, NextFunction } from 'express';
import Theater from '../Models/TheaterModel';
import { JwtPayload } from 'jsonwebtoken';

interface CustomRequest extends Request {
  theaterOwner?: {
    _id: string;
  } | null;
}

const protect = expressAsyncHandler(async (req: CustomRequest, res: Response, next: NextFunction) => {
  let token: string | undefined = req.cookies?.theaterOwnerJwt;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_THEATER as string) as JwtPayload;
      req.theaterOwner = await Theater.findById(decoded.userId).select('-password');

      if (!req.theaterOwner) {
        res.status(401);
        throw new Error('Not authorized, theater Owner not found');
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

export { protect };
