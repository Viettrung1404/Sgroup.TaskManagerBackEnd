import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

export type WorkspaceType = z.infer<typeof WorkspaceSchema>;
export const WorkspaceSchema = z.object({
    id: z.uuid(),
    title: z.string().max(255),
    description: z.string().optional(),
    visibility: z.enum(['private', 'public']).optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

// Dùng trong service
export const CreateWorkspaceSchema = z.object({
    title: z.string().max(255),
    description: z.string().optional(),
    visibility: z.enum(['private', 'public']).optional(),
    adminId: z.uuid(),
});
export type CreateWorkspaceType = z.infer<typeof CreateWorkspaceSchema>;

// Schema for add member to workspace (dùng trong request body)
export const AddMemberSchema = z.object({
    userId: z.uuid(),
    roleId: z.uuid().optional(), // Optional để có thể dùng default role
});

// Input Validation for 'GET Workspaces/:id' endpoint
export const GetWorkspaceSchema = z.object({
    params: z.object({ id: z.uuid() }),
});

// Role Schema (nested object)
export const RoleSchema = z.object({
    id: z.uuid(),
    name: z.string(),
    description: z.string().nullable().optional(),
});

// User Schema (nested object for workspace member)
export const UserInWorkspaceSchema = z.object({
    id: z.uuid(),
    email: z.email(),
    name: z.string().nullable().optional(),
    avatarUrl: z.string().nullable().optional(),
});

// Workspace info trong member response
export const WorkspaceInMemberSchema = z.object({
    id: z.uuid(),
    title: z.string(),
    description: z.string().optional(),
    visibility: z.enum(['private', 'public']).optional(),
});

// Workspace Member Schema (đầy đủ với relations)
export type WorkspaceMemberType = z.infer<typeof WorkspaceMemberSchema>;
export const WorkspaceMemberSchema = z.object({
    id: z.uuid(),
    createdAt: z.date(),
    updatedAt: z.date(),
    // Relations - REQUIRED vì luôn cần thiết
    role: RoleSchema,
    user: UserInWorkspaceSchema,
    workspace: WorkspaceInMemberSchema,
});

// Schema for creating a new WorkspaceMember (excludes auto-generated fields)
export const CreateWorkspaceMemberSchema = z.object({
    userId: z.uuid(),
    roleId: z.uuid().optional(),
});
export type CreateWorkspaceMemberType = z.infer<
    typeof CreateWorkspaceMemberSchema
>;

// Schema for updating a WorkspaceMember's role
export const UpdateWorkspaceMemberRoleSchema = z.object({
    roleId: z.uuid(),
});
export type UpdateWorkspaceMemberRoleType = z.infer<
    typeof UpdateWorkspaceMemberRoleSchema
>;

// Xóa workspace member
export const DeleteWorkspaceMemberSchema = z.object({
    userId: z.uuid(),
});
export type DeleteWorkspaceMemberType = z.infer<
    typeof DeleteWorkspaceMemberSchema
>;
