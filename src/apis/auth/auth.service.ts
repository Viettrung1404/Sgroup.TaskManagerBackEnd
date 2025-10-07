import { User } from '../../common/entities/user.entity';
import AuthProvider from '../../common/providers/auth.provider';
import HashProvider from '../../common/providers/hash.provider';
import usersService from '../users/users.service';

type RegisterUserPayload = {
    email: string;
    password: string;
    name?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
    isActive?: boolean;
};

type LoginUserPayload = {
    email: string;
    password: string;
};

type SanitizedUser = {
    id: string;
    email: string;
    name: string | null;
    bio: string | null;
    avatarUrl: string | null;
    isActive: boolean;
};

const sanitizeUser = (user: User): SanitizedUser => ({
    id: user.id,
    email: user.email,
    name: user.name ?? null,
    bio: user.bio ?? null,
    avatarUrl: user.avatarUrl ?? null,
    isActive: user.isActive ?? false,
});

export const registerUser = async (
    userData: RegisterUserPayload
): Promise<SanitizedUser> => {
    try {
        const existingUser = await usersService.findByEmail(userData.email);
        if (existingUser) {
            throw new Error('User already exists');
        }

        const hashedPassword = await HashProvider.generateHash(
            userData.password
        );
        const userPayload: Partial<User> = {
            email: userData.email,
            password: hashedPassword,
            isActive: userData.isActive ?? true,
        };

        if (userData.name != null) {
            userPayload.name = userData.name;
        }

        if (userData.bio != null) {
            userPayload.bio = userData.bio;
        }

        if (userData.avatarUrl != null) {
            userPayload.avatarUrl = userData.avatarUrl;
        }

        const createdUser = await usersService.createUser(userPayload);

        return sanitizeUser(createdUser);
    } catch (error: unknown) {
        console.error('Error creating user:', error);
        throw error instanceof Error
            ? error
            : new Error('Unable to register user');
    }
};

export const loginUser = async (
    userData: LoginUserPayload
): Promise<{ user: SanitizedUser; token: string }> => {
    try {
        const user = await usersService.findByEmail(userData.email);
        if (!user) {
            throw new Error('User not found');
        }

        const isPasswordValid = await HashProvider.compareHash(
            userData.password,
            user.password
        );
        if (!isPasswordValid) {
            throw new Error('Invalid password');
        }

        const token = await AuthProvider.encodeToken({
            id: user.id,
            email: user.email,
        });

        return {
            user: sanitizeUser(user),
            token,
        };
    } catch (error: unknown) {
        console.error('Error logging in user:', error);
        throw error instanceof Error
            ? error
            : new Error('Unable to login user');
    }
};
