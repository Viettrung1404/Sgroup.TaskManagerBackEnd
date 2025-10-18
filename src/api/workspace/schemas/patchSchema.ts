import {
    extendZodWithOpenApi,
    ZodRequestBody,
} from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

export const UpdateWorkspaceContentSchema = z.object({
    title: z.string().min(2).max(100).optional(),
    description: z.string().max(500).optional(),
});

// Dùng cho api docs workspaces
export const PatchWorkspace: ZodRequestBody = {
    description: 'Update an existing workspace',
    content: {
        'application/json': {
            schema: UpdateWorkspaceContentSchema,
        },
    },
};

// Dùng để truyền cho router nhánh workspaces
export const PatchWorkspaceSchema = z.object({
    body: UpdateWorkspaceContentSchema,
    params: z.object({ id: z.uuid('ID must be a valid UUID') }),
});

// schema update member
export const UpdateMemberContentSchema = z.object({
    roleId: z.uuid('Role ID must be a valid UUID'),
});

// Dùng cho api docs workspaces members
export const PatchMember: ZodRequestBody = {
    description: 'Update an existing workspace member',
    content: {
        'application/json': {
            schema: UpdateMemberContentSchema,
        },
    },
};

// Dùng để truyền cho router nhánh workspace members
export const PatchMemberSchema = z.object({
    body: UpdateMemberContentSchema,
    params: z.object({
        id: z.uuid('ID must be a valid UUID'),
        memberId: z.uuid('ID must be a valid UUID'),
    }),
});
