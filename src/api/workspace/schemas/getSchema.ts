import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

import { commonValidations } from '@/common/utils/commonValidation';

extendZodWithOpenApi(z);

// Dùng cho api docs workspaces
export type Workspace = z.infer<typeof WorkspaceSchema>;
export const WorkspaceSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    members: z.array(commonValidations.id).optional(),
    boards: z.array(commonValidations.id).optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

// Dùng để truyền cho router nhánh workspaces/:id
export const GetWorkspaceSchema = z.object({
    params: z.object({ id: z.uuid('ID must be a valid UUID') }),
});

// Dùng để truyền cho router nhánh workspaces/:id/members
export const GetMemberSchema = z.object({
    params: z.object({
        id: z.uuid('ID must be a valid UUID'),
        memberId: z.uuid('ID must be a valid UUID'),
    }),
});
