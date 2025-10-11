import 'reflect-metadata';

import { config } from 'dotenv';
import { DataSource } from 'typeorm';

import { RefreshToken } from '@/common/entities/refresh-token.entity';

import { Board } from '../common/entities/board.entity';
import { Card } from '../common/entities/card.entity';
import { CardMembers } from '../common/entities/card-members.entity';
import { Comment } from '../common/entities/comment.entity';
import { List } from '../common/entities/list.entity';
import { Notification } from '../common/entities/notification.entity';
import { User } from '../common/entities/user.entity';
import { Workspace } from '../common/entities/workspace.entity';
import { WorkspaceMembers } from '../common/entities/workspace-members.entity';

config();

export default new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '123456',
    database: process.env.DB_NAME || 'test_db',
    synchronize: true,
    logging: false,
    entities: [
        User,
        Workspace,
        WorkspaceMembers,
        Board,
        List,
        Card,
        CardMembers,
        Comment,
        Notification,
        RefreshToken,
    ],
    migrations: ['src/migration/**/*.ts'],
    subscribers: [],
});
