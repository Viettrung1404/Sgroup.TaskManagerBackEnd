import { Repository } from 'typeorm';
import { AppDataSource } from '../../config/database.config';
import { User } from '../../entities/user.entity';

export class UsersService {
    private get repo(): Repository<User> {
        return AppDataSource.getRepository(User);
    }

    async getUsers(): Promise<User[]> {
        return this.repo.find();
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.repo.findOneBy({ email });
    }

    async findById(id: number): Promise<User | null> {
        return this.repo.findOneBy({ id });
    }
}

export default new UsersService();
