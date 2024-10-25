import jwt from 'jsonwebtoken';
import { Response } from 'express';

class TokenService {
    private jwtSecret: string;

    constructor() {
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined');
        }
        this.jwtSecret = process.env.JWT_SECRET;
    }

    public generateToken(res: Response, userId: string): void {
        const token = jwt.sign({ userId }, this.jwtSecret, {
            expiresIn: '30d',
        });

        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000, 
        });
    }
}

export default new TokenService();
