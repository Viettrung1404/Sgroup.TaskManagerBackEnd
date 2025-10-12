import { Repository } from 'typeorm';

import { User } from '@/common/entities/user.entity';
import { Workspace } from '@/common/entities/workspace.entity';
import { WorkspaceMembers } from '@/common/entities/workspace-member.entity';
import AppDataSource from '@/config/database.config';

export class WorkspaceMembersRepository {
    private repo: Repository<WorkspaceMembers> =
        AppDataSource.getRepository(WorkspaceMembers);
    private userRepo = AppDataSource.getRepository(User);
    private workspaceRepo = AppDataSource.getRepository(Workspace);

    async listMembers(workspaceId: string) {
        return this.repo.find({
            where: { workspace: { id: workspaceId } },
            relations: { user: true, workspace: true },
        });
    }

    async addMember(workspaceId: string, userId: string, role: number) {
        const [workspace, user] = await Promise.all([
            this.workspaceRepo.findOne({ where: { id: workspaceId } }),
            this.userRepo.findOne({ where: { id: userId } }),
        ]);
        if (!workspace) throw new Error('Workspace not found');
        if (!user) throw new Error('User not found');

        const exists = await this.repo.findOne({
            where: { workspace: { id: workspaceId }, user: { id: userId } },
        });
        if (exists)
            throw new Error('User is already a member of the workspace');

        const entity = this.repo.create({ workspace, user, role });
        return this.repo.save(entity);
    }

    async updateMemberRole(workspaceId: string, userId: string, role: number) {
        const membership = await this.repo.findOne({
            where: { workspace: { id: workspaceId }, user: { id: userId } },
            relations: { workspace: true, user: true },
        });
        if (!membership) throw new Error('Membership not found');
        membership.role = role;
        return this.repo.save(membership);
    }

    async removeMember(workspaceId: string, userId: string) {
        const membership = await this.repo.findOne({
            where: { workspace: { id: workspaceId }, user: { id: userId } },
        });
        if (!membership) return;
        await this.repo.delete(membership.id);
    }
}
