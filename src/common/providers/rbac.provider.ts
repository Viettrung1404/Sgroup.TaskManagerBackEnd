import { Permission } from '@/common/entities/permission.entity';
import { Role } from '@/common/entities/role.entity';
import { RolePermission } from '@/common/entities/role-permission.entity';
import { UserRole } from '@/common/entities/user-role.entity';
import AppDataSource from '@/config/database.config';

export class RbacProvider {
    static async getUserRoles(userId: string): Promise<string[]> {
        const rows = await AppDataSource.getRepository(UserRole)
            .createQueryBuilder('userRole')
            .innerJoin(Role, 'role', 'role.id = userRole.roleId')
            .where('userRole.userId = :userId', { userId })
            .select('LOWER(role.name)', 'name')
            .getRawMany<{ name: string }>();

        // unique + normalized
        return Array.from(new Set(rows.map((r) => r.name.trim())));
    }

    static async getUserPermissions(userId: string): Promise<string[]> {
        const rows = await AppDataSource.getRepository(RolePermission)
            .createQueryBuilder('rolePermission')
            .innerJoin(
                Permission,
                'permission',
                'permission.id = rolePermission.permissionId'
            )
            .innerJoin(
                UserRole,
                'userRole',
                'userRole.roleId = rolePermission.roleId'
            )
            .where('userRole.userId = :userId', { userId })
            .select('LOWER(permission.name)', 'name')
            .distinct(true)
            .getRawMany<{ name: string }>();

        return Array.from(new Set(rows.map((r) => r.name.trim())));
    }

    static async attachUserAuthz(userId: string) {
        const [roles, permissions] = await Promise.all([
            this.getUserRoles(userId),
            this.getUserPermissions(userId),
        ]);
        return { roles, permissions };
    }
}
