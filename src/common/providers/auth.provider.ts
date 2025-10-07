import { JwtPayload, SignOptions, sign, verify } from 'jsonwebtoken';
import 'dotenv/config';

interface TokenSubject {
    id: string;
    email: string;
    role?: string | null;
}

export interface TokenPayload extends JwtPayload, TokenSubject {}

class AuthProvider {
    async encodeToken(user: TokenSubject): Promise<string> {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT secret is not configured');
        }

        try {
            const expiresIn = (process.env.JWT_EXPIRES_IN ??
                '1d') as SignOptions['expiresIn'];
            const options: SignOptions = {
                expiresIn,
                algorithm: 'HS256',
            };

            return sign(
                {
                    id: user.id,
                    email: user.email,
                    role: user.role ?? null,
                },
                secret,
                options
            );
        } catch {
            throw new Error('Error encoding token');
        }
    }

    async decodeToken(token: string): Promise<TokenPayload> {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT secret is not configured');
        }

        try {
            const decoded = verify(token, secret);
            if (typeof decoded === 'string') {
                throw new Error('Invalid token payload');
            }
            return decoded as TokenPayload;
        } catch {
            throw new Error('Error decoding token');
        }
    }
}

export default new AuthProvider();
