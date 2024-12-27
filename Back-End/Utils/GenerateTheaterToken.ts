import { Response } from 'express';
import jwt from 'jsonwebtoken';

class TheaterTokenService {
    private readonly jwtSecret: string;

    constructor() {
        const jwtSecret = process.env.JWT_SECRET_THEATER;
        if (!jwtSecret) {
            throw new Error('Environment variable JWT_SECRET_THEATER is not defined');
        }
        this.jwtSecret = jwtSecret;
    }

    public generateTheaterToken(res: Response, theaterOwnerId: string, expiresIn: string = '30d'): void {
        const token = jwt.sign({ id: theaterOwnerId }, this.jwtSecret, { expiresIn });

        res.cookie('theaterOwnerJwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: this.getMaxAge(expiresIn),
        });
    }

    private getMaxAge(expiresIn: string): number {
        const match = expiresIn.match(/^(\d+)([dhms])$/);
        if (!match) {
            throw new Error('Invalid expiresIn format. Use a number followed by "d", "h", "m", or "s".');
        }

        const [, value, unit] = match;
        const numValue = parseInt(value, 10);

        switch (unit) {
            case 'd': return numValue * 24 * 60 * 60 * 1000;
            case 'h': return numValue * 60 * 60 * 1000;
            case 'm': return numValue * 60 * 1000;
            case 's': return numValue * 1000;
            default: throw new Error('Invalid time unit. Use "d", "h", "m", or "s".');
        }
    }
}

export default new TheaterTokenService();

