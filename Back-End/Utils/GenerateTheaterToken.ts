// utils/GenerateTheaterToken.ts

import { Response } from 'express';
import jwt from 'jsonwebtoken';

const generateTheaterToken = (res: Response, theaterOwnerId: string): void => {
    const token = jwt.sign({ id: theaterOwnerId }, process.env.JWT_SECRET!, { expiresIn: '1h' });

    res.cookie('theaterOwnerJwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
    });
};

export default generateTheaterToken;
