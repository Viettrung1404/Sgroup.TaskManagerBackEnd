import { Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';

import { DateTimeEntity } from './base/dateTimeEntity';
import { Board } from './board.entity';
import { Role } from './role.entity';
import { User } from './user.entity';

@Unique(['user', 'board'])
@Entity('board_members')
export class BoardMembers extends DateTimeEntity {
    @PrimaryGeneratedColumn('uuid')
    public id: string;

    @ManyToOne(() => Role)
    public role: Role;

    @ManyToOne(() => User, (user) => user.boardMembers)
    public user: User;

    @ManyToOne(() => Board, (board) => board.boardMembers)
    public board: Board;
}
