import { Request, Response } from 'express';

import * as AuthService from './auth.service';
import { User } from '../../common/entities/user.entity';
import { TokenPayload } from '../../common/providers/auth.provider';
import usersService from '../users/users.service';

type RouteParams = Record<string, string>;

type RegisterRequestBody = {
    email: string;
    password: string;
    name?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
    isActive?: boolean;
    [key: string]: unknown;
};

type LoginRequestBody = {
    email: string;
    password: string;
};

type RegisterRequest = Request<RouteParams, unknown, RegisterRequestBody>;
type LoginRequest = Request<RouteParams, unknown, LoginRequestBody>;
type AuthenticatedRequest = Request<RouteParams> & { user: TokenPayload };

const sanitizeUser = (user: User) => ({
    id: user.id,
    email: user.email,
    name: user.name ?? null,
    bio: user.bio ?? null,
    avatarUrl: user.avatarUrl ?? null,
    isActive: user.isActive ?? false,
});

export const registerUser = async (
    req: RegisterRequest,
    res: Response
): Promise<void> => {
    try {
        const newUser = await AuthService.registerUser(req.body);
        res.status(201).json(newUser);
    } catch (error: unknown) {
        const message =
            error instanceof Error ? error.message : 'Unable to register user';
        res.status(400).json({ error: message });
    }
};

export const loginUser = async (
    req: LoginRequest,
    res: Response
): Promise<void> => {
    try {
        const loginResult = await AuthService.loginUser(req.body);
        res.status(200).json(loginResult);
    } catch (error: unknown) {
        const message =
            error instanceof Error ? error.message : 'Unable to login user';
        res.status(400).json({ error: message });
    }
};

export const getMe = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        const user = await usersService.findById(req.user.id);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.status(200).json(sanitizeUser(user));
    } catch (error: unknown) {
        const message =
            error instanceof Error
                ? error.message
                : 'Unable to fetch user profile';
        res.status(400).json({ error: message });
    }
};
