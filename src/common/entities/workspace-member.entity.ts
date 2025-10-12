import {
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    Unique,
} from 'typeorm';

import { DateTimeEntity } from './base/dateTimeEntity';
import { User } from './user.entity';
import { Workspace } from './workspace.entity';

@Unique(['user', 'workspace'])
@Entity('workspace_members')
export class WorkspaceMembers extends DateTimeEntity {
    @PrimaryGeneratedColumn('uuid')
    public id: string;

    @Column({ type: 'int' })
    public role: number;

    @ManyToOne(() => User, (user) => user.workspaceMembers)
    public user: User;

    @ManyToOne(() => Workspace, (workspace) => workspace.workspaceMembers)
    public workspace: Workspace;
}
