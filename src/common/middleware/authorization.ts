import { NextFunction, Request, Response } from 'express';

import AuthenticatedRequest from '@/common/declare/authenticationRequest.declare';
import { RbacProvider } from '@/common/providers/rbac.provider';

// import AuthenticatedRequest from '../declare/authenticationRequest.declare';

// chuẩn hóa danh sách (lowercase + trim)
function normalize(list?: string[]) {
    return (list ?? []).map((x) => x.toLowerCase().trim());
}

export async function preloadUserAuthz(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const authReq = req as AuthenticatedRequest;
        if (!authReq.user)
            return res.status(401).json({ message: 'Unauthorized' });
        const userId = authReq.user.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        // Chỉ load nếu chưa có
        if (!authReq.user.roles || !authReq.user.permissions) {
            const { roles, permissions } =
                await RbacProvider.attachUserAuthz(userId);
            authReq.user.roles = roles;
            authReq.user.permissions = permissions;
        }
        next();
    } catch (err) {
        next(err);
    }
}

export function requirePermissions(
    required: string[] | string,
    options?: { any?: boolean; preload?: boolean }
) {
    const requiredList = normalize(
        Array.isArray(required) ? required : [required]
    );
    const matchAny = options?.any === true;
    const shouldPreload = options?.preload !== false; // mặc định preload

    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            if (!authReq.user)
                return res.status(401).json({ message: 'Unauthorized' });
            const userId = authReq.user.userId;
            if (!userId)
                return res.status(401).json({ message: 'Unauthorized' });

            if (
                shouldPreload &&
                (!authReq.user.permissions || !authReq.user.roles)
            ) {
                const { roles, permissions } =
                    await RbacProvider.attachUserAuthz(userId);
                authReq.user.roles = roles;
                authReq.user.permissions = permissions;
            }
            // in ra role và permission
            console.log('🚀 ~ authReq.user.roles:', authReq.user.roles);
            console.log(
                '🚀 ~ authReq.user.permissions:',
                authReq.user.permissions
            );
            const userPerms = new Set(normalize(authReq.user.permissions));
            const matches = requiredList.map((p) => userPerms.has(p));
            const ok = matchAny
                ? matches.some(Boolean)
                : matches.every(Boolean);
            if (!ok) return res.status(403).json({ message: 'Forbidden' });

            next();
        } catch (err) {
            next(err);
        }
    };
}

export function requireRoles(
    required: string[] | string,
    options?: { any?: boolean; preload?: boolean }
) {
    const requiredList = normalize(
        Array.isArray(required) ? required : [required]
    );
    const matchAny = options?.any === true;
    const shouldPreload = options?.preload !== false;

    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            if (!authReq.user)
                return res.status(401).json({ message: 'Unauthorized' });
            const userId = authReq.user.userId;
            if (!userId)
                return res.status(401).json({ message: 'Unauthorized' });

            if (
                shouldPreload &&
                (!authReq.user.roles || !authReq.user.permissions)
            ) {
                const { roles, permissions } =
                    await RbacProvider.attachUserAuthz(userId);
                authReq.user.roles = roles;
                authReq.user.permissions = permissions;
            }

            const userRoles = new Set(normalize(authReq.user.roles));
            const matches = requiredList.map((r) => userRoles.has(r));
            const ok = matchAny
                ? matches.some(Boolean)
                : matches.every(Boolean);
            if (!ok) return res.status(403).json({ message: 'Forbidden' });

            next();
        } catch (err) {
            next(err);
        }
    };
}
