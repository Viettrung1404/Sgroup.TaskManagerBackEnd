import { StatusCodes } from 'http-status-codes';

import { MailTrigger } from '@/common/enums/enumBase';
import {
    ResponseStatus,
    ServiceResponse,
} from '@/common/models/serviceResponse';
import { generateJwt, sendEmail } from '@/common/utils';
import { logger } from '@/server';

import { WorkspaceMemberRepository } from './workspaceMemberRepository';
import {
    CreateWorkspaceMemberType,
    CreateWorkspaceType,
    UpdateWorkspaceMemberRoleType,
    WorkspaceMemberType,
    WorkspaceType,
} from './workspaceModel';
import { WorkspaceRepository } from './workspaceRepository';

class WorkspaceService {
    constructor(
        private workspaceRepository: WorkspaceRepository,
        private workspaceMemberRepository: WorkspaceMemberRepository
    ) {}

    // Workspace CRUD operations
    async findAll(): Promise<ServiceResponse<WorkspaceType[] | null>> {
        try {
            const workspaces = await this.workspaceRepository.findAll();
            if (!workspaces || workspaces.length === 0) {
                return new ServiceResponse(
                    ResponseStatus.Failed,
                    'No Workspaces found',
                    null,
                    StatusCodes.NOT_FOUND
                );
            }
            return new ServiceResponse<WorkspaceType[]>(
                ResponseStatus.Success,
                'Workspaces found',
                workspaces,
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = `Error finding all workspaces: ${(ex as Error).message}`;
            logger.error(errorMessage);
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    }

    async findById(id: string): Promise<ServiceResponse<WorkspaceType | null>> {
        try {
            const workspace = await this.workspaceRepository.findById(id);
            if (!workspace) {
                return new ServiceResponse(
                    ResponseStatus.Failed,
                    'Workspace not found',
                    null,
                    StatusCodes.NOT_FOUND
                );
            }
            return new ServiceResponse<WorkspaceType>(
                ResponseStatus.Success,
                'Workspace found',
                workspace,
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = `Error finding workspace with id ${id}: ${(ex as Error).message}`;
            logger.error(errorMessage);
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    }

    async createWorkspace(
        data: CreateWorkspaceType
    ): Promise<ServiceResponse<WorkspaceType | null>> {
        try {
            const newWorkspace =
                await this.workspaceRepository.createWorkspace(data);
            return new ServiceResponse<WorkspaceType>(
                ResponseStatus.Success,
                'Workspace created successfully',
                newWorkspace,
                StatusCodes.CREATED
            );
        } catch (ex) {
            const errorMessage = `Error creating workspace: ${(ex as Error).message}`;
            logger.error(errorMessage);
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    }

    async updateWorkspace(
        id: string,
        data: Partial<WorkspaceType>
    ): Promise<ServiceResponse<WorkspaceType | null>> {
        try {
            const updatedWorkspace =
                await this.workspaceRepository.updateWorkspace(id, data);
            if (!updatedWorkspace) {
                return new ServiceResponse(
                    ResponseStatus.Failed,
                    'Workspace not found',
                    null,
                    StatusCodes.NOT_FOUND
                );
            }
            return new ServiceResponse<WorkspaceType>(
                ResponseStatus.Success,
                'Workspace updated successfully',
                updatedWorkspace,
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = `Error updating workspace with id ${id}: ${(ex as Error).message}`;
            logger.error(errorMessage);
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    }

    async deleteWorkspace(id: string): Promise<ServiceResponse<null>> {
        try {
            await this.workspaceRepository.deleteWorkspace(id);
            return new ServiceResponse(
                ResponseStatus.Success,
                'Workspace deleted successfully',
                null,
                StatusCodes.NO_CONTENT
            );
        } catch (ex) {
            const errorMessage = `Error deleting workspace with id ${id}: ${(ex as Error).message}`;
            logger.error(errorMessage);
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    }

    // Workspace - Member CRUD operations
    async listMembers(
        workspaceId: string
    ): Promise<ServiceResponse<WorkspaceMemberType[] | null>> {
        try {
            const members =
                await this.workspaceMemberRepository.listMembers(workspaceId);
            return new ServiceResponse<WorkspaceMemberType[]>(
                ResponseStatus.Success,
                'Members retrieved successfully',
                members,
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = `Error listing members for workspace with id ${workspaceId}: ${(ex as Error).message}`;
            logger.error(errorMessage);
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    }

    async listWorkspaces(
        userId: string
    ): Promise<ServiceResponse<any[] | null>> {
        try {
            const workspaces =
                await this.workspaceMemberRepository.listWorkspaces(userId);
            return new ServiceResponse(
                ResponseStatus.Success,
                'Workspaces retrieved successfully',
                workspaces,
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = `Error listing workspaces for user with id ${userId}: ${(ex as Error).message}`;
            logger.error(errorMessage);
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    }

    async addMember(
        workspaceId: string,
        data: CreateWorkspaceMemberType
    ): Promise<ServiceResponse<WorkspaceMemberType | null>> {
        try {
            const newMember = await this.workspaceMemberRepository.addMember(
                workspaceId,
                data
            );
            if (!newMember) {
                return new ServiceResponse(
                    ResponseStatus.Failed,
                    'Failed to add member',
                    null,
                    StatusCodes.BAD_REQUEST
                );
            }
            const inviteLink = `${process.env.FRONTEND_URL}/w/${generateJwt({ code: newMember.user.id })}`;
            sendEmail(MailTrigger.VerifyEmail, {
                email: newMember.user.email,
                inviteLink,
            });
            return new ServiceResponse(
                ResponseStatus.Success,
                'Member added successfully',
                newMember,
                StatusCodes.CREATED
            );
        } catch (ex) {
            const errorMessage = `Error adding member to workspace: ${(ex as Error).message}`;
            logger.error(errorMessage);
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    }

    async updateMemberRole(
        workspaceId: string,
        memberId: string,
        data: UpdateWorkspaceMemberRoleType
    ): Promise<ServiceResponse<WorkspaceMemberType | null>> {
        try {
            const updatedMember =
                await this.workspaceMemberRepository.updateMemberRole(
                    workspaceId,
                    memberId,
                    data
                );
            return new ServiceResponse(
                ResponseStatus.Success,
                'Member role updated successfully',
                updatedMember,
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = `Error updating member role in workspace: ${(ex as Error).message}`;
            logger.error(errorMessage);
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    }

    async removeMember(
        workspaceId: string,
        memberId: string
    ): Promise<ServiceResponse<null>> {
        try {
            const success = await this.workspaceMemberRepository.removeMember(
                workspaceId,
                memberId
            );
            if (!success) {
                return new ServiceResponse(
                    ResponseStatus.Failed,
                    'Membership not found',
                    null,
                    StatusCodes.NOT_FOUND
                );
            }
            return new ServiceResponse(
                ResponseStatus.Success,
                'Member removed successfully',
                null,
                StatusCodes.NO_CONTENT
            );
        } catch (ex) {
            const errorMessage = `Error removing member from workspace: ${(ex as Error).message}`;
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

export const workspaceService = new WorkspaceService(
    new WorkspaceRepository(),
    new WorkspaceMemberRepository()
);
