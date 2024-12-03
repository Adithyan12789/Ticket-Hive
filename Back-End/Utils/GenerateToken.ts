// import jwt from 'jsonwebtoken';
// import { Response } from 'express';

// class TokenService {
//     private jwtSecret: string;

//     constructor() {
//         if (!process.env.JWT_SECRET) {
//             throw new Error('JWT_SECRET is not defined');
//         }
//         this.jwtSecret = process.env.JWT_SECRET;
//     }

//     public generateToken(res: Response, userId: string): void {
//         const token = jwt.sign({ userId }, this.jwtSecret, {
//             expiresIn: '30d',
//         });

//         res.cookie('jwt', token, {
//             httpOnly: true,
//             secure: process.env.NODE_ENV !== 'development',
//             sameSite: 'strict',
//             maxAge: 30 * 24 * 60 * 60 * 1000, 
//         });
//     }
// }

// export default new TokenService();



import jwt from 'jsonwebtoken';
import { Response, Request } from 'express';

class TokenService {
    private jwtSecret: string;
    private jwtRefreshSecret: string;

    constructor() {
        if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
            throw new Error('JWT_SECRET or JWT_REFRESH_SECRET is not defined');
        }
        this.jwtSecret = process.env.JWT_SECRET;
        this.jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
    }

    public generateTokens(res: Response, userId: string): { accessToken: string, refreshToken: string } {
        const accessToken = jwt.sign({ userId }, this.jwtSecret, {
            expiresIn: '15m',
        });
    
        const refreshToken = jwt.sign({ userId }, this.jwtRefreshSecret, {
            expiresIn: '30d',
        });
    
        // Set the access and refresh tokens in cookies
        res.cookie('jwt_access', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development', // Ensure secure flag for production
            sameSite: 'strict', // Restrict cross-site cookie sending
            maxAge: 15 * 60 * 1000, // Access token expiry time (15 minutes)
        });
    
        res.cookie('jwt_refresh', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });
    
        return { accessToken, refreshToken };
    }    

    public verifyAccessToken(token: string) {
        try {
            return jwt.verify(token, this.jwtSecret);
        } catch (error) {
            return null;
        }
    }

    public verifyRefreshToken(token: string) {
        try {
            return jwt.verify(token, this.jwtRefreshSecret);
        } catch (error) {
            return null;
        }
    }

    public refreshAccessToken(req: Request, res: Response): void {
        const refreshToken = req.cookies['jwt_refresh'];
    
        if (!refreshToken) {
            res.status(401).json({ message: 'Refresh token is required' });
            return;
        }

        const decoded = this.verifyRefreshToken(refreshToken);
    
        if (!decoded || typeof decoded === 'string') {
            res.status(401).json({ message: 'Invalid or expired refresh token' });
            return;
        }

        const accessToken = jwt.sign({ userId: decoded.userId }, this.jwtSecret, {
            expiresIn: '15m',
        });
    
        res.cookie('jwt_access', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000,
        });
    
        res.status(200).json({ message: 'Access token refreshed' });
    }   
    
    
    public generateAccessToken(userId: string): string {
        return jwt.sign({ userId }, this.jwtSecret, {
            expiresIn: '15m',
        });
    }
}

export default new TokenService();
