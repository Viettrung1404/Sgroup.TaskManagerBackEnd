import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

import { authService } from '@/api/auth/authService';
import { userService } from '@/api/user/userService';
import { env, generateJwt } from '@/common/utils';

// Cấu hình Passport.js
export const configurePassport = () => {
    // Serialize user để lưu vào session
    passport.serializeUser((user: any, done) => {
        done(null, user.id);
    });

    // Deserialize user khi lấy từ session
    passport.deserializeUser(async (id: string, done) => {
        try {
            const response = await userService.findById(id);
            if (response.success && response.responseObject) {
                done(null, response.responseObject);
            } else {
                done(new Error('User not found'), false);
            }
        } catch (error) {
            done(error, false);
        }
    });

    // Cấu hình Google Strategy
    passport.use(
        new GoogleStrategy(
            {
                clientID: env.GOOGLE_CLIENT_ID,
                clientSecret: env.GOOGLE_CLIENT_SECRET,
                callbackURL: env.GOOGLE_CALLBACK_URL,
                scope: ['profile', 'email'],
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    // Tìm user dựa trên Google ID
                    const googleId = profile.id;
                    const email = profile.emails?.[0]?.value;

                    if (!email) {
                        return done(
                            new Error('Email not provided by Google'),
                            false
                        );
                    }

                    // Kiểm tra xem user đã tồn tại chưa
                    const existingUserResponse =
                        await userService.findByEmail(email);

                    if (
                        existingUserResponse.success &&
                        existingUserResponse.responseObject
                    ) {
                        // Nếu user đã tồn tại, cập nhật Google ID nếu chưa có
                        const existingUser =
                            existingUserResponse.responseObject;

                        if (!existingUser.googleId) {
                            const updateResponse = await userService.updateById(
                                existingUser.id,
                                {
                                    googleId,
                                }
                            );

                            if (
                                updateResponse.success &&
                                updateResponse.responseObject
                            ) {
                                return done(
                                    null,
                                    updateResponse.responseObject
                                );
                            }
                        }

                        return done(null, existingUser);
                    } else {
                        // Nếu user chưa tồn tại, tạo user mới
                        const displayName =
                            profile.displayName || 'Google User';
                        const avatar = profile.photos?.[0]?.value;

                        const newUserResponse = await userService.create({
                            email,
                            name: displayName,
                            googleId,
                            avatarUrl: avatar,
                            password: '', // User đăng nhập qua Google không cần password
                        });

                        if (
                            newUserResponse.success &&
                            newUserResponse.responseObject
                        ) {
                            // Gọi hàm verifyEmail để đánh dấu email đã được xác thực
                            await authService.verifyEmail(
                                generateJwt({
                                    code: newUserResponse.responseObject.id,
                                })
                            );
                            return done(null, newUserResponse.responseObject);
                        } else {
                            return done(
                                new Error(
                                    newUserResponse.message ||
                                        'Failed to create user'
                                ),
                                false
                            );
                        }
                    }
                } catch (error: any) {
                    return done(error, false);
                }
            }
        )
    );

    return passport;
};
