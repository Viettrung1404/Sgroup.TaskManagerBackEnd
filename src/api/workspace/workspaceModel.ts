import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

export type WorkspaceType = z.infer<typeof WorkspaceSchema>;
export const WorkspaceSchema = z.object({
    id: z.uuid(),
    title: z.string().max(255),
    description: z.string().optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

// Schema for creating a new Workspace (excludes auto-generated fields)
export const CreateWorkspaceSchema = z.object({
    title: z.string().max(255),
    description: z.string().optional(),
});

export type CreateWorkspaceType = z.infer<typeof CreateWorkspaceSchema>;

// Input Validation for 'GET Workspaces/:id' endpoint
export const GetWorkspaceSchema = z.object({
    params: z.object({ id: z.uuid() }),
});
