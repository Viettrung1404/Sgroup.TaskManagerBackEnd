import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

export type UserType = z.infer<typeof UserSchema>;
export const UserSchema = z.object({
    id: z.uuid(),
    email: z.email(),
    password: z.string().optional(), // Usually not returned in responses
    name: z.string().optional(),
    bio: z.string().optional(),
    avatarUrl: z.string().optional(),
    googleId: z.string().optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
    roles: z.array(z.string()).optional(),
    permissions: z.array(z.string()).optional(),
});

// Schema for creating a new user (excludes auto-generated fields)
export const CreateUserSchema = z.object({
    email: z.email(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().optional(),
    bio: z.string().optional(),
    avatarUrl: z.string().optional(),
    googleId: z.string().optional(),
    roles: z.array(z.string()).optional(),
    permissions: z.array(z.string()).optional(),
});

export type CreateUserType = z.infer<typeof CreateUserSchema>;

// Input Validation for 'GET users/:id' endpoint
export const GetUserSchema = z.object({
    params: z.object({ id: z.uuid() }),
});
