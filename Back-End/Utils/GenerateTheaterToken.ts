import { Response } from 'express';
import jwt from 'jsonwebtoken';

class TheaterTokenService {
    private jwtSecret: string;
    private jwts = process.env.JWT_SECRET_THEATER || 'metasploit192167';

    constructor() {
        if (!this.jwts) {
            throw new Error('JWT_SECRET_THEATER is not defined');
        }
        this.jwtSecret = this.jwts;
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
