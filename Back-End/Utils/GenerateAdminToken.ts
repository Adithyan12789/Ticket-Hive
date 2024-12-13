import { Response } from 'express';
import jwt from 'jsonwebtoken';

class AdminTokenService {
    private jwtSecret: string;

    constructor() {
        if (!process.env.JWT_SECRET_ADMIN) {
            throw new Error('JWT_SECRET_ADMIN is not defined');
        }
        this.jwtSecret = process.env.JWT_SECRET_ADMIN as string;
    }

    public generateAdminToken(res: Response, adminId: string): void {
        const token = jwt.sign({ adminId }, this.jwtSecret, {
            expiresIn: '30d',
        });

        res.cookie('jwtAdmin', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000,
            path: '/',
        });
    }
}

export default new AdminTokenService();
