import { Response } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET_THEATER="metasploit192167";

class TheaterTokenService {
    private jwtSecret: string;

    constructor() {
        if (!JWT_SECRET_THEATER) {
            throw new Error('JWT_SECRET_THEATER is not defined');
        }
        this.jwtSecret = JWT_SECRET_THEATER;
    }

    public generateTheaterToken(res: Response, theaterOwnerId: string): void {
        const token = jwt.sign({ id: theaterOwnerId }, this.jwtSecret, { expiresIn: '30d' });

        res.cookie('theaterOwnerJwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });
    }
}

export default new TheaterTokenService();
