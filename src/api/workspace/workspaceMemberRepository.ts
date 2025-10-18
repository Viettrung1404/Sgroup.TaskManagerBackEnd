import { Repository } from 'typeorm';

import { Role } from '@/common/entities/role.entity';
import { User } from '@/common/entities/user.entity';
import { Workspace } from '@/common/entities/workspace.entity';
import { WorkspaceMembers } from '@/common/entities/workspace-member.entity';
import AppDataSource from '@/config/database.config';

import {
    CreateWorkspaceMemberType,
    UpdateWorkspaceMemberRoleType,
    WorkspaceMemberType,
} from './workspaceModel';

export class WorkspaceMemberRepository {
    private repo: Repository<WorkspaceMembers> =
        AppDataSource.getRepository(WorkspaceMembers);
    private userRepo = AppDataSource.getRepository(User);
    private workspaceRepo = AppDataSource.getRepository(Workspace);
    private roleRepo = AppDataSource.getRepository(Role);

    async listMembers(workspaceId: string): Promise<WorkspaceMembers[]> {
        return this.repo.find({
            where: { workspace: { id: workspaceId } },
            relations: { user: true, workspace: true },
        });
    }

    // danh sách workspace của user
    async listWorkspaces(userId: string): Promise<WorkspaceMembers[]> {
        return this.repo.find({
            where: { user: { id: userId } },
            relations: { user: true, workspace: true },
        });
    }

    async addMember(
        workspaceId: string,
        data: CreateWorkspaceMemberType
    ): Promise<WorkspaceMemberType | null> {
        const { userId, roleId } = data;
        const [workspace, user, role] = await Promise.all([
            this.workspaceRepo.findOne({ where: { id: workspaceId } }),
            this.userRepo.findOne({ where: { id: userId } }),
            this.roleRepo.findOne({ where: { id: roleId } }),
        ]);
        if (!workspace) throw new Error('Workspace not found');
        if (!user) throw new Error('User not found');
        if (!role) throw new Error('Role not found');

        const exists = await this.repo.findOne({
            where: { workspace: { id: workspaceId }, user: { id: userId } },
        });
        if (exists)
            throw new Error('User is already a member of the workspace');

        const entity = this.repo.create({ workspace, user, role });
        return this.repo.save(entity);
    }

    async updateMemberRole(
        workspaceId: string,
        memberId: string,
        data: UpdateWorkspaceMemberRoleType
    ): Promise<WorkspaceMemberType | null> {
        const { roleId } = data;
        const membership = await this.repo.findOne({
            where: { workspace: { id: workspaceId }, user: { id: memberId } },
            relations: { workspace: true, user: true },
        });
        if (!membership) throw new Error('Membership not found');
        const role = await this.roleRepo.findOne({ where: { id: roleId } });
        if (!role) throw new Error('Role not found');
        membership.role = role;
        return this.repo.save(membership);
    }

    async removeMember(
        workspaceId: string,
        memberId: string
    ): Promise<boolean> {
        const membership = await this.repo.findOne({
            where: { workspace: { id: workspaceId }, user: { id: memberId } },
        });
        if (!membership) return false;
        await this.repo.delete(membership.id);
        return true;
    }
}
