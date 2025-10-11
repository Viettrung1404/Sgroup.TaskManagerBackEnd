import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Request, Response, Router } from 'express';
import passport from 'passport';
import { z } from 'zod';

import { PostUser, PostUserSchema } from '@/api/user/schemas/createUserSchema';
import { UserSchema } from '@/api/user/schemas/userSchema';
import { createApiResponse } from '@/api-docs/openAPIResponseBuilders';
import authenticateJWT from '@/common/middleware/authentication';
import {
    handleServiceResponse,
    validateRequest,
} from '@/common/utils/httpHandlers';

import { authService } from './authService';
import {
    Login,
    PostLogin,
    PostLoginSchema,
    PostVerifyEmailSchema,
    TokenSchema,
} from './schemas/authSchema';

export const authRegistry = new OpenAPIRegistry();

authRegistry.register('Token', TokenSchema);
authRegistry.register('PostLogin', PostLoginSchema);

const router = express.Router();

// Registering OpenAPI paths
const registerPaths = () => {
    authRegistry.registerPath({
        method: 'post',
        path: '/auth/register',
        tags: ['Auth'],
        request: { body: PostUser },
        responses: createApiResponse(UserSchema, 'Success'),
    });

    authRegistry.registerPath({
        method: 'post',
        path: '/auth/login',
        tags: ['Auth'],
        request: { body: PostLogin },
        responses: createApiResponse(TokenSchema, 'Success'),
    });

    authRegistry.registerPath({
        method: 'post',
        path: '/auth/verify-email?token={token}',
        tags: ['Auth'],
        request: { query: PostVerifyEmailSchema.shape.query },
        responses: createApiResponse(z.boolean(), 'Success', 201),
    });

    authRegistry.registerPath({
        method: 'get',
        path: '/auth/google',
        tags: ['Auth'],
        responses: createApiResponse(z.string(), 'Redirect URL'),
    });

    authRegistry.registerPath({
        method: 'get',
        path: '/auth/google/callback',
        tags: ['Auth'],
        responses: createApiResponse(z.string(), 'Redirect URL'),
    });

    authRegistry.registerPath({
        method: 'post',
        path: '/auth/refresh',
        tags: ['Auth'],
        security: [{ bearerAuth: [] }],
        responses: createApiResponse(TokenSchema, 'Success'),
    });
};

// Route to create a new user
router.post(
    '/register',
    validateRequest(PostUserSchema),
    async (req: Request, res: Response) => {
        const userData = req.body;
        const serviceResponse = await authService.register(userData);
        handleServiceResponse(serviceResponse, res);
    }
);

// Route to verify email
router.post(
    '/verify-email',
    validateRequest(PostVerifyEmailSchema),
    async (req: Request, res: Response) => {
        const token = req.query.token as string;
        const serviceResponse = await authService.verifyEmail(token);
        handleServiceResponse(serviceResponse, res);
    }
);

// Route to login
router.post(
    '/login',
    validateRequest(PostLoginSchema),
    async (req: Request, res: Response) => {
        const userData = req.body as Login;
        const serviceResponse = await authService.login(userData);
        handleServiceResponse(serviceResponse, res);
    }
);

// Google OAuth login route (truyền state nếu muốn nhận JSON ở callback)
router.get('/google', (req: Request, res: Response, next) => {
    const responseType = (req.query.responseType as string) || undefined; // 'json' | undefined
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        session: false,
        state: responseType === 'json' ? 'json' : undefined,
    })(req, res, next);
});

// Google OAuth callback route (custom callback)
router.get('/google/callback', (req: Request, res: Response, next) => {
    passport.authenticate(
        'google',
        { session: false },
        async (err, user: any) => {
            if (err) return next(err);

            const wantsJson = req.query.state === 'json';

            if (!user || !user.id) {
                if (wantsJson) {
                    return res.status(401).json({
                        success: false,
                        message: 'authentication_failed',
                    });
                }
                return res.redirect('/login?error=authentication_failed');
            }

            const serviceResponse = await authService.issueTokensForUserId(
                user.id
            );
            if (!serviceResponse.success || !serviceResponse.responseObject) {
                if (wantsJson) {
                    return handleServiceResponse(serviceResponse, res);
                }
                return res.redirect('/login?error=token_issue_failed');
            }

            if (wantsJson) {
                return handleServiceResponse(serviceResponse, res);
            }

            const { accessToken, refreshToken } =
                serviceResponse.responseObject;
            const frontend =
                process.env.FRONTEND_URL || 'http://localhost:3000';
            const redirectUrl = `${frontend}/auth/success#accessToken=${encodeURIComponent(accessToken)}&refreshToken=${encodeURIComponent(refreshToken)}`;
            return res.redirect(redirectUrl);
        }
    )(req, res, next);
});

// Optional: endpoint refresh token
router.post(
    '/refresh',
    authenticateJWT,
    async (req: Request, res: Response) => {
        const refreshToken = req.headers.authorization?.split(' ')[1] || '';
        const serviceResponse = await authService.refreshTokens(refreshToken);
        handleServiceResponse(serviceResponse, res);
    }
);

registerPaths();

export const authRouter: Router = router;
