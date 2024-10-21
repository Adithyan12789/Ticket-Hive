import jwt from 'jsonwebtoken';
import expressAsyncHandler from 'express-async-handler';
import { Request, Response, NextFunction } from 'express';

interface CustomRequest extends Request {
  admin?: string | object;
}

const protect = expressAsyncHandler(async (req: CustomRequest, res: Response, next: NextFunction) => {
  let token: string | undefined = req.cookies?.jwtAdmin;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_ADMIN as string);
      req.admin = decoded;

      next();
    } catch (error) {
      res.status(401);
      throw new Error('Not Authorized, invalid token');
    }
  } else {
    res.status(401);
    throw new Error('Not Authorized, no token');
  }
});

export { protect };
