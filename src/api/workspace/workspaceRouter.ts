import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Request, Response, Router } from 'express';
import { z } from 'zod';

import { createApiResponse } from '@/api-docs/openAPIResponseBuilders';
import AuthenticatedRequest from '@/common/declare/authenticationRequest.declare';
import authenticateJWT from '@/common/middleware/authentication';
import { requireWorkspacePermissions } from '@/common/middleware/authorization';
import {
    handleServiceResponse,
    validateRequest,
} from '@/common/utils/httpHandlers';

import { UserSchema } from '../user/userModel';
import {
    GetMemberSchema,
    GetWorkspaceSchema,
    PatchWorkspace,
    PatchWorkspaceSchema,
    PostWorkspace,
    PostWorkspaceMember,
    PostWorkspaceMemberSchema,
    PostWorkspaceSchema,
    WorkspaceSchema,
} from './schemas';
import { PatchMember, PatchMemberSchema } from './schemas/patchSchema';
import { workspaceService } from './workspaceService';

export const workspaceRegistry = new OpenAPIRegistry();

workspaceRegistry.register('Workspace', WorkspaceSchema);
workspaceRegistry.register('PostWorkspace', PostWorkspaceSchema);

const router = express.Router();

// Registering OpenAPI paths
const registerPaths = () => {
    workspaceRegistry.registerPath({
        method: 'post',
        path: '/workspaces',
        tags: ['Workspace'],
        request: { body: PostWorkspace },
        responses: createApiResponse(WorkspaceSchema, 'Success'),
    });

    workspaceRegistry.registerPath({
        method: 'get',
        path: '/workspaces',
        tags: ['Workspace'],
        responses: createApiResponse(z.array(WorkspaceSchema), 'Success'),
    });

    workspaceRegistry.registerPath({
        method: 'get',
        path: '/workspaces/{id}',
        tags: ['Workspace'],
        request: { params: GetWorkspaceSchema.shape.params },
        responses: createApiResponse(WorkspaceSchema, 'Success'),
    });

    workspaceRegistry.registerPath({
        method: 'put',
        path: '/workspaces/{id}',
        tags: ['Workspace'],
        request: {
            params: PatchWorkspaceSchema.shape.params,
            body: PatchWorkspace,
        },
        responses: createApiResponse(WorkspaceSchema, 'Success'),
    });

    workspaceRegistry.registerPath({
        method: 'delete',
        path: '/workspaces/{id}',
        tags: ['Workspace'],
        request: { params: GetWorkspaceSchema.shape.params },
        responses: createApiResponse(WorkspaceSchema, 'Success'),
    });

    // workspace-members
    workspaceRegistry.registerPath({
        method: 'get',
        path: '/workspaces/{id}/members',
        tags: ['Workspace'],
        request: { params: GetWorkspaceSchema.shape.params },
        responses: createApiResponse(z.array(UserSchema), 'Success'),
    });

    workspaceRegistry.registerPath({
        method: 'post',
        path: '/workspaces/{id}/members',
        tags: ['Workspace'],
        request: {
            params: GetWorkspaceSchema.shape.params,
            body: PostWorkspaceMember,
        },
        responses: createApiResponse(z.array(UserSchema), 'Success'),
    });

    workspaceRegistry.registerPath({
        method: 'patch',
        path: '/workspaces/{id}/members/{memberId}',
        tags: ['Workspace'],
        request: {
            params: GetMemberSchema.shape.params,
            body: PatchMember,
        },
        responses: createApiResponse(z.array(UserSchema), 'Success'),
    });

    workspaceRegistry.registerPath({
        method: 'delete',
        path: '/workspaces/{id}/members/{memberId}',
        tags: ['Workspace'],
        request: {
            params: GetMemberSchema.shape.params,
        },
        responses: createApiResponse(z.array(UserSchema), 'Success'),
    });
};

// Route to create a new workspace
router.post(
    '/',
    authenticateJWT,
    validateRequest(PostWorkspaceSchema),
    async (req: Request, res: Response) => {
        const workspaceData = req.body;
        const authReq = req as AuthenticatedRequest;
        workspaceData.adminId = authReq.user?.userId;
        console.log('🚀 ~ workspaceData:', workspaceData);

        const serviceResponse =
            await workspaceService.createWorkspace(workspaceData);
        handleServiceResponse(serviceResponse, res);
    }
);

// Route to get all workspaces
router.get('/', authenticateJWT, async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const serviceResponse = await workspaceService.listWorkspaces(userId);
    handleServiceResponse(serviceResponse, res);
});

// Route to get a workspace by id
router.get(
    '/:id',
    authenticateJWT,
    requireWorkspacePermissions('workspaces:read'),
    validateRequest(GetWorkspaceSchema),
    async (req: Request, res: Response) => {
        const id = req.params.id;
        const serviceResponse = await workspaceService.findById(id);
        handleServiceResponse(serviceResponse, res);
    }
);

// Route to update a workspace by id
router.put(
    '/:id',
    authenticateJWT,
    requireWorkspacePermissions('workspaces:update'),
    validateRequest(PatchWorkspaceSchema),
    async (req: Request, res: Response) => {
        const id = req.params.id;
        const workspaceData = req.body;
        const serviceResponse = await workspaceService.updateWorkspace(
            id,
            workspaceData
        );
        handleServiceResponse(serviceResponse, res);
    }
);

// Route to delete a workspace by id
router.delete(
    '/:id',
    authenticateJWT,
    requireWorkspacePermissions('workspaces:delete'),
    validateRequest(GetWorkspaceSchema),
    async (req: Request, res: Response) => {
        const id = req.params.id;
        const serviceResponse = await workspaceService.deleteWorkspace(id);
        handleServiceResponse(serviceResponse, res);
    }
);

// Route to get all members of a workspace
router.get(
    '/:id/members',
    authenticateJWT,
    requireWorkspacePermissions('workspaces:read'),
    validateRequest(GetWorkspaceSchema),
    async (req: Request, res: Response) => {
        const id = req.params.id;
        const serviceResponse = await workspaceService.listMembers(id);
        handleServiceResponse(serviceResponse, res);
    }
);

// Route to add a member to a workspace
router.post(
    '/:id/members',
    authenticateJWT,
    requireWorkspacePermissions('workspaces:manage'),
    validateRequest(PostWorkspaceMemberSchema),
    async (req: Request, res: Response) => {
        const id = req.params.id;
        const memberData = req.body;
        const serviceResponse = await workspaceService.addMember(
            id,
            memberData
        );
        handleServiceResponse(serviceResponse, res);
    }
);

// Route to update a member's role in a workspace
router.put(
    '/:id/members',
    authenticateJWT,
    requireWorkspacePermissions('workspaces:manage'),
    validateRequest(PatchMemberSchema),
    async (req: Request, res: Response) => {
        const { id, memberId } = req.params;
        const memberData = req.body;
        const serviceResponse = await workspaceService.updateMemberRole(
            id,
            memberId,
            memberData
        );
        handleServiceResponse(serviceResponse, res);
    }
);

// Route to remove a member from a workspace
router.delete(
    '/:id/members/:memberId',
    authenticateJWT,
    requireWorkspacePermissions('workspaces:manage'),
    validateRequest(GetMemberSchema),
    async (req: Request, res: Response) => {
        const id = req.params.id;
        const memberId = req.params.memberId;
        const serviceResponse = await workspaceService.removeMember(
            id,
            memberId
        );
        handleServiceResponse(serviceResponse, res);
    }
);

registerPaths();

export const workspaceRouter: Router = router;
