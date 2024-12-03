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








// import jwt from 'jsonwebtoken';
// import expressAsyncHandler from 'express-async-handler';
// import { Request, Response, NextFunction } from 'express';
// import User from '../Models/UserModel';

// interface CustomRequest extends Request {
//   user?: {
//     _id: string;
//     isBlocked: boolean;
//   };
// }

// class AuthMiddleware {
//   static protect = expressAsyncHandler(async (req: CustomRequest, res: Response, next: NextFunction) => {
//     const accessToken = req.cookies?.accessToken;
//     const refreshToken = req.cookies?.refreshToken;

//     console.log('Access Token received:', accessToken);
//     console.log('Refresh Token received:', refreshToken);

//     if (accessToken) {
//       try {
//         const decoded = jwt.verify(accessToken, process.env.JWT_SECRET as string) as { userId: string };

//         const user = await User.findById(decoded.userId).select('-password');

//         if (!user || user.isBlocked) {
//           console.log('User is blocked or not found');
//           res.clearCookie('jwt', { path: '/' });
//           res.status(401).json({ message: 'User is blocked or not authorized' });
//           return;
//         }

//         req.user = {
//           _id: user._id.toString(),
//           isBlocked: user.isBlocked ?? false
//         };

//         next();
//       } catch (error) {
//         if (error instanceof jwt.TokenExpiredError) {
//           console.log('Access token expired');
//           if (refreshToken) {
//             try {
//               const refreshDecoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as { userId: string };
              
//               const user = await User.findById(refreshDecoded.userId).select('-password');

//               if (!user || user.isBlocked) {
//                 console.log('User is blocked or not found during refresh');
//                 res.clearCookie('jwt', { path: '/' });
//                 res.status(401).json({ message: 'User is blocked or not authorized' });
//                 return;
//               }

//               const newAccessToken = jwt.sign(
//                 { userId: user._id },
//                 process.env.JWT_SECRET as string,
//                 { expiresIn: '30d' }
//               );

//               res.cookie('jwt', newAccessToken, {
//                 httpOnly: true,
//                 secure: process.env.NODE_ENV !== 'development',
//                 sameSite: 'strict',
//                 maxAge: 30 * 24 * 60 * 60 * 1000,
//               });

//               req.user = {
//                 _id: user._id.toString(),
//                 isBlocked: user.isBlocked ?? false
//               };

//               next();
//             } catch (err) {
//               console.log('Invalid refresh token');
//               res.status(401).json({ message: 'Not authorized, invalid refresh token' });
//             }
//           } else {
//             console.log('No refresh token provided');
//             res.status(401).json({ message: 'Not authorized, no refresh token' });
//           }
//         } else {
//           console.log('Token verification failed');
//           res.status(401).json({ message: 'Not authorized, invalid token' });
//         }
//         return;
//       }
//     } else {
//       console.log('No access token provided');
//       res.status(401).json({ message: 'Not authorized, no access token' });
//       return;
//     }
//   });
// }

// export { AuthMiddleware, CustomRequest };
