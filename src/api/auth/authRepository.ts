import { RefreshToken } from '@/common/entities/refresh-token.entity';
import AppDataSource from '@/config/database.config';

export interface RefreshTokenRecord {
    jti: string;
    userId: string;
    hash: string;
    expiresAt: Date;
    revoked: boolean;
    createdAt?: Date;
    replacedByJti?: string;
    userAgent?: string;
    ip?: string;
}

export class RefreshTokenRepository {
    private repo = AppDataSource.getRepository(RefreshToken);

    async save(rec: RefreshTokenRecord) {
        // Nếu rec.jti đã có (đồng bộ với jti trong JWT), TypeORM sẽ dùng jti đó.
        const entity = this.repo.create(rec as any);
        return await this.repo.save(entity);
    }

    async findByJti(jti: string) {
        return await this.repo.findOne({ where: { jti } });
    }

    async revoke(jti: string, replacedByJti?: string) {
        await this.repo.update({ jti }, { revoked: true, replacedByJti });
        return await this.findByJti(jti);
    }

    async revokeAllByUserId(userId: string) {
        await this.repo
            .createQueryBuilder()
            .update(RefreshToken)
            .set({ revoked: true })
            .where('userId = :userId', { userId })
            .execute();
    }
}
