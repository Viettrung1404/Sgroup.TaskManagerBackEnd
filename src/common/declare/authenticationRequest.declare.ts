import { Request } from 'express';

interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        roles?: string[];
        permissions?: string[];
        [key: string]: any;
    };
}

export default AuthenticatedRequest;
