import { Response } from 'express';
import jwt from 'jsonwebtoken';

const generateAdminToken = (res: Response, userId: string): void => {
  if (!process.env.JWT_SECRET_ADMIN) {
    throw new Error('JWT_SECRET_ADMIN is not defined');
  }

  const token = jwt.sign({ userId }, process.env.JWT_SECRET_ADMIN as string, {
    expiresIn: '30d',
  });

  res.cookie('jwtAdmin', token, {
    httpOnly: true,  
    secure: process.env.NODE_ENV === 'production',  
    sameSite: 'lax',  
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: '/',
  });
};

export default generateAdminToken;
