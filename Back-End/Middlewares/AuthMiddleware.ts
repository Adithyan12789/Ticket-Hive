import jwt from 'jsonwebtoken';
import expressAsyncHandler from 'express-async-handler';
import { Request, Response, NextFunction } from 'express';
import User from '../Models/UserModel';

interface CustomRequest extends Request {
  user?: {
    _id: string;
    isBlocked: boolean;
  };
}

class AuthMiddleware {
  static protect = expressAsyncHandler(async (req: CustomRequest, res: Response, next: NextFunction) => {
    const token = req.cookies?.jwt;
    console.log('Token received:', token);

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };

        const user = await User.findById(decoded.userId).select('-password');

        if (!user || user.isBlocked) {
          console.log('User is blocked or not found');
          res.clearCookie('jwt', { path: '/' });
          res.status(401).json({ message: 'User is blocked or not authorized' });
          return;
        }

        req.user = {
          _id: user._id.toString(),
          isBlocked: user.isBlocked ?? false
        };

        next();
      } catch (error) {
        console.log('Token verification failed');
        res.status(401).json({ message: 'Not authorized, invalid token' });
        return;
      }
    } else {
      console.log('No token provided');
      res.status(401).json({ message: 'Not authorized, no token' });
      return;
    }
  });
}

export { AuthMiddleware, CustomRequest };
