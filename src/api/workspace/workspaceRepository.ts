import { Workspace } from '@/common/entities/workspace.entity';
import AppDataSource from '@/config/database.config';

export class WorkspaceRepository {
    private repo = AppDataSource.getRepository(Workspace);

    async findAll(): Promise<Workspace[]> {
        return this.repo.find();
    }

    async findById(id: string): Promise<Workspace | null> {
        return this.repo.findOne({ where: { id } });
    }

    async createWorkspace(data: Partial<Workspace>): Promise<Workspace> {
        const workspace = this.repo.create(data);
        return this.repo.save(workspace);
    }

    async updateWorkspace(
        id: string,
        data: Partial<Workspace>
    ): Promise<Workspace | null> {
        await this.repo.update(id, data);
        return this.findById(id);
    }

    async deleteWorkspace(id: string): Promise<void> {
        await this.repo.delete(id);
    }

    async findByIdAsync(id: string): Promise<Workspace | null> {
        return this.repo.findOneBy({ id: id });
    }

    async createWorkspaceAsync(
        workspaceData: Partial<Workspace>
    ): Promise<Workspace> {
        const newWorkspace = this.repo.create(workspaceData);
        return this.repo.save(newWorkspace);
    }

    async updateWorkspaceAsync(
        id: string,
        updateData: Partial<Workspace>
    ): Promise<Workspace | null> {
        await this.repo.update(id, updateData);
        return this.repo.findOneBy({ id });
    }

    async deleteWorkspaceAsync(id: string): Promise<void> {
        await this.repo.delete(id);
    }
}
