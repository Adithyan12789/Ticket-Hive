import { Response } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET_THEATER="metasploit192167";

class TheaterTokenService {
    private jwtSecret: string;

    constructor() {
        console.log("JWT_SECRET_THEATER: ", JWT_SECRET_THEATER);
        

        if (JWT_SECRET_THEATER) {
            this.jwtSecret = JWT_SECRET_THEATER;
            console.log("this.jwtSecret: ", this.jwtSecret);
        }else{
            throw new Error('JWT_SECRET_THEATER is not defined');
        }
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
