import {
    extendZodWithOpenApi,
    ZodRequestBody,
} from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

export const CreateWorkspaceContentSchema = z.object({
    title: z.string().min(2).max(100),
    description: z.string().max(500).optional(),
    visibility: z.enum(['private', 'public']).optional(),
});

// Dùng cho api docs workspaces
export const PostWorkspace: ZodRequestBody = {
    description: 'Create a new workspace',
    content: {
        'application/json': {
            schema: CreateWorkspaceContentSchema,
        },
    },
};

// Dùng để truyền cho router nhánh workspaces
export const PostWorkspaceSchema = z.object({
    body: CreateWorkspaceContentSchema,
});

export const CreateWorkspaceMemberContentSchema = z.object({
    userId: z.uuid('User ID must be a valid UUID'),
    roleId: z.uuid('Role ID must be a valid UUID'), // Optional để có thể dùng default role
});

// Dùng cho api docs workspaces
export const PostWorkspaceMember: ZodRequestBody = {
    description: 'Add a new workspace member',
    content: {
        'application/json': {
            schema: CreateWorkspaceMemberContentSchema,
        },
    },
};

// Dùng để truyền cho router nhánh workspaces
export const PostWorkspaceMemberSchema = z.object({
    body: CreateWorkspaceMemberContentSchema,
});
