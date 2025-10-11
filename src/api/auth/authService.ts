import bcrypt from 'bcryptjs';
import { createHash, randomUUID } from 'crypto';
import { StatusCodes } from 'http-status-codes';

import { UserRepository } from '@/api/user/userRepository';
import { User } from '@/common/entities/user.entity';
import { MailTrigger } from '@/common/enums/enumBase';
import {
    ResponseStatus,
    ServiceResponse,
} from '@/common/models/serviceResponse';
import { generateJwt, verifyJwt } from '@/common/utils/jwtUtils';
import { sendEmail } from '@/common/utils/mailService';
import { logger } from '@/server';

import { RefreshTokenRepository } from './authRepository';
import { Login, Token } from './schemas/authSchema';

export class AuthService {
    constructor(
        private userRepository: UserRepository,
        private refreshTokenRepository: RefreshTokenRepository
    ) {}

    // Register user
    async register(userData: User): Promise<ServiceResponse<User | null>> {
        try {
            const user = await this.userRepository.findByEmailAsync(
                userData.email
            );
            if (user) {
                return new ServiceResponse(
                    ResponseStatus.Failed,
                    'Email already exists',
                    null,
                    StatusCodes.BAD_REQUEST
                );
            }

            const hashedPassword = await bcrypt.hash(userData.password, 10);

            const newUser = await this.userRepository.createUserAsync({
                ...userData,
                password: hashedPassword,
            });

            if (!newUser) {
                return new ServiceResponse(
                    ResponseStatus.Failed,
                    'Error creating user',
                    null,
                    StatusCodes.INTERNAL_SERVER_ERROR
                );
            }

            const activationLink = `${process.env.FRONTEND_URL}/activate?token=${generateJwt({ code: newUser.id })}`;
            sendEmail(MailTrigger.VerifyEmail, {
                email: userData.email,
                activationLink,
            });

            return new ServiceResponse<User>(
                ResponseStatus.Success,
                'User registered successfully! Please check your email to activate your account.',
                newUser,
                StatusCodes.CREATED
            );
        } catch (ex) {
            const errorMessage = `Error creating user: ${(ex as Error).message}`;
            logger.error(errorMessage);
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    }

    private hash(value: string) {
        return createHash('sha256').update(value).digest('hex');
    }

    // TTL riêng cho refresh token (vd 30 ngày)
    private refreshTtlMs = Number(
        process.env.REFRESH_TOKEN_TTL_MS || 1000 * 60 * 60 * 24 * 30
    );

    // Verify email
    async verifyEmail(token: string): Promise<ServiceResponse<boolean>> {
        try {
            const decoded = verifyJwt(token);

            // Extract the user ID from the decoded JWT payload
            let userId: string;
            if (
                typeof decoded === 'object' &&
                decoded !== null &&
                'code' in decoded
            ) {
                userId = (decoded as any).code;
            } else {
                return new ServiceResponse(
                    ResponseStatus.Failed,
                    'Invalid token format',
                    false,
                    StatusCodes.BAD_REQUEST
                );
            }

            const user = await this.userRepository.findByIdAsync(userId);
            if (!user) {
                return new ServiceResponse(
                    ResponseStatus.Failed,
                    'User not found',
                    false,
                    StatusCodes.NOT_FOUND
                );
            }

            if (user.isActive) {
                return new ServiceResponse(
                    ResponseStatus.Success,
                    'Email already verified',
                    true,
                    StatusCodes.OK
                );
            }

            user.isActive = true;
            await this.userRepository.updateUserAsync(user.id, user);

            return new ServiceResponse<boolean>(
                ResponseStatus.Success,
                'Email verified successfully',
                true,
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = `Error verifying email: ${(ex as Error).message}`;
            logger.error(errorMessage);
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                false,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    }

    // +++ thống nhất phát hành token: nếu có repo => stateful, ngược lại => stateless
    private async mintTokens(
        userId: string,
        meta?: { ua?: string; ip?: string }
    ): Promise<Token> {
        if (!this.refreshTokenRepository) {
            return this.buildTokens(userId);
        }

        const jti = randomUUID();
        const accessToken = generateJwt({ userId });
        const refreshToken = generateJwt({ userId, type: 'refresh', jti });

        const expiresAt = new Date(Date.now() + this.refreshTtlMs);
        await this.refreshTokenRepository.save({
            jti,
            userId,
            hash: this.hash(refreshToken),
            expiresAt,
            revoked: false,
            createdAt: new Date(),
            userAgent: meta?.ua,
            ip: meta?.ip,
        });

        return {
            accessToken,
            refreshToken,
            expiresIn: process.env.JWT_EXPIRES_IN || '1d',
            tokenType: 'Bearer',
        };
    }

    private buildTokens(userId: string): Token {
        const expiresIn = process.env.JWT_EXPIRES_IN || '1d';
        return {
            accessToken: generateJwt({ userId }),
            // Gắn cờ type để phân biệt refresh token
            refreshToken: generateJwt({ userId, type: 'refresh' }),
            expiresIn,
            tokenType: 'Bearer',
        };
    }

    // Login user
    async login(loginData: Login): Promise<ServiceResponse<Token | null>> {
        try {
            const user = await this.userRepository.findByEmailAsync(
                loginData.email
            );
            if (!user) {
                return new ServiceResponse(
                    ResponseStatus.Failed,
                    'User not found',
                    null,
                    StatusCodes.NOT_FOUND
                );
            }

            if (!user.isActive) {
                return new ServiceResponse(
                    ResponseStatus.Failed,
                    'User is not activated',
                    null,
                    StatusCodes.UNAUTHORIZED
                );
            }

            const passwordMatch = await bcrypt.compare(
                loginData.password,
                user.password
            );
            if (!passwordMatch) {
                return new ServiceResponse(
                    ResponseStatus.Failed,
                    'Invalid password',
                    null,
                    StatusCodes.UNAUTHORIZED
                );
            }

            const token: Token = await this.mintTokens(user.id, {
                ua: (loginData as any)?.ua,
                ip: (loginData as any)?.ip,
            });

            return new ServiceResponse<Token>(
                ResponseStatus.Success,
                'Login successful',
                token,
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = `Error logging in: ${(ex as Error).message}`;
            logger.error(errorMessage);
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    }

    // Phát hành token cho luồng OAuth (đầu vào là userId từ Passport)
    async issueTokensForUserId(
        userId: string
    ): Promise<ServiceResponse<Token | null>> {
        try {
            const user = await this.userRepository.findByIdAsync(userId);
            if (!user) {
                return new ServiceResponse(
                    ResponseStatus.Failed,
                    'User not found',
                    null,
                    StatusCodes.NOT_FOUND
                );
            }
            if (!user.isActive) {
                return new ServiceResponse(
                    ResponseStatus.Failed,
                    'User is not activated',
                    null,
                    StatusCodes.UNAUTHORIZED
                );
            }

            // +++ dùng mintTokens
            const token = await this.mintTokens(user.id);
            return new ServiceResponse<Token>(
                ResponseStatus.Success,
                'Login successful',
                token,
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = `Error issuing tokens: ${(ex as Error).message}`;
            logger.error(errorMessage);
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    }

    // Refresh token (stateful nếu có repo, ngược lại stateless như cũ)
    async refreshTokens(
        refreshToken: string
    ): Promise<ServiceResponse<Token | null>> {
        try {
            const decoded = verifyJwt(refreshToken) as any;
            if (!decoded || decoded.type !== 'refresh' || !decoded.userId) {
                return new ServiceResponse(
                    ResponseStatus.Failed,
                    'Invalid refresh token',
                    null,
                    StatusCodes.UNAUTHORIZED
                );
            }

            // +++ stateful branch
            if (this.refreshTokenRepository) {
                if (!decoded.jti) {
                    return new ServiceResponse(
                        ResponseStatus.Failed,
                        'Invalid refresh token (missing jti)',
                        null,
                        StatusCodes.UNAUTHORIZED
                    );
                }

                const rec = await this.refreshTokenRepository.findByJti(
                    decoded.jti
                );
                if (!rec || rec.revoked) {
                    return new ServiceResponse(
                        ResponseStatus.Failed,
                        'Refresh token revoked or not found',
                        null,
                        StatusCodes.UNAUTHORIZED
                    );
                }
                if (rec.expiresAt.getTime() < Date.now()) {
                    return new ServiceResponse(
                        ResponseStatus.Failed,
                        'Refresh token expired',
                        null,
                        StatusCodes.UNAUTHORIZED
                    );
                }
                if (rec.hash !== this.hash(refreshToken)) {
                    await this.refreshTokenRepository.revoke(rec.jti);
                    return new ServiceResponse(
                        ResponseStatus.Failed,
                        'Refresh token mismatch',
                        null,
                        StatusCodes.UNAUTHORIZED
                    );
                }

                // Rotation
                const newTokens = await this.mintTokens(rec.userId);
                const newDecoded = verifyJwt(newTokens.refreshToken) as any;
                await this.refreshTokenRepository.revoke(
                    rec.jti,
                    newDecoded?.jti
                );

                return new ServiceResponse<Token>(
                    ResponseStatus.Success,
                    'Token refreshed',
                    newTokens,
                    StatusCodes.OK
                );
            }

            // --- stateless fallback
            const tokens = this.buildTokens(decoded.userId);
            return new ServiceResponse<Token>(
                ResponseStatus.Success,
                'Token refreshed',
                tokens,
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = `Error refreshing token: ${(ex as Error).message}`;
            logger.error(errorMessage);
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    }
}

export const authService = new AuthService(
    new UserRepository(),
    new RefreshTokenRepository()
);
