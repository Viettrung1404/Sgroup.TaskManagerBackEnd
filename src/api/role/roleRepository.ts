import { Role } from '@/common/entities/role.entity';
import AppDataSource from '@/config/database.config';

export class RoleRepository {
    private repo = AppDataSource.getRepository(Role);
    async findAll(): Promise<Role[]> {
        return this.repo.find();
    }

    async findById(id: string): Promise<Role | null> {
        return this.repo.findOne({ where: { id } });
    }

    async findByName(name: string): Promise<Role | null> {
        return this.repo.findOne({ where: { name } });
    }

    async createRole(data: Partial<Role>): Promise<Role> {
        const role = this.repo.create(data);
        return this.repo.save(role);
    }

    async updateRole(id: string, data: Partial<Role>): Promise<Role | null> {
        await this.repo.update(id, data);
        return this.findById(id);
    }

    async deleteRole(id: string): Promise<void> {
        await this.repo.delete(id);
    }
}
