// utils/GenerateTheaterToken.ts

import { Response } from 'express';
import jwt from 'jsonwebtoken';

const generateTheaterToken = (res: Response, theaterOwnerId: string): void => {
    const token = jwt.sign({ id: theaterOwnerId }, process.env.JWT_SECRET_THEATER!, { expiresIn: '30d' });

    res.cookie('theaterOwnerJwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000,
    });
};

export default generateTheaterToken;
