import { NextFunction, Request, Response } from 'express';

import { verifyJwt } from '@/common/utils/jwtUtils';

export interface AuthenticatedRequest extends Request {
    user: { userId: string; [key: string]: any };
}

// Thay đổi kiểu tham số req từ AuthenticatedRequest thành Request
const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    console.log('🚀 ~ authenticateJWT ~ authHeader:', authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Access token required' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = verifyJwt(token);

        if (!decoded || typeof decoded !== 'object') {
            return res.status(401).json({ message: 'Invalid token' });
        }

        // Gán user vào req và sử dụng type assertion
        (req as AuthenticatedRequest).user = decoded as {
            userId: string;
            [key: string]: any;
        };
        next();
    } catch (error) {
        console.error('JWT verification failed:', error);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

export default authenticateJWT;
