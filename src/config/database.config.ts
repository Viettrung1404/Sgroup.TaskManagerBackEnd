import 'reflect-metadata';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { Board } from '../common/entities/board.entity';
import { CardMembers } from '../common/entities/card-members.entity';
import { Card } from '../common/entities/card.entity';
import { Comment } from '../common/entities/comment.entity';
import { List } from '../common/entities/list.entity';
import { Notification } from '../common/entities/notification.entity';
import { ProjectMembers } from '../common/entities/project-members.entity';
import { Project } from '../common/entities/project.entity';
import { User } from '../common/entities/user.entity';

config();

export const AppDataSource = new DataSource({
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
        Project,
        ProjectMembers,
        Board,
        List,
        Card,
        CardMembers,
        Comment,
        Notification,
    ],
    migrations: ['src/migration/**/*.ts'],
    subscribers: [],
});
