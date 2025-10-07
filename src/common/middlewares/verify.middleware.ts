import { NextFunction, Request, Response } from 'express';

import authProvider from '../providers/auth.provider';

interface AuthenticatedRequest extends Request {
    user?: unknown;
}

export class VerifyMiddleware {
    static async validateToken(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const header = req.headers.authorization;
            if (!header) {
                res.status(401).json({ message: 'Not log yet' });
                return;
            }
            const token = header.split(' ')[1];
            const decoded = await authProvider.decodeToken(token);
            req.user = decoded;
            next();
        } catch (error) {
            next(error);
        }
    }
}
