import { Repository } from 'typeorm';
import { User } from '../../common/entities/user.entity';
import { AppDataSource } from '../../config/database.config';

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

    async findById(id: string): Promise<User | null> {
        return this.repo.findOneBy({ id });
    }
    async createUser(userData: Partial<User>): Promise<User> {
        const newUser = this.repo.create(userData);
        return this.repo.save(newUser);
    }
    async updateUser(
        id: string,
        updateData: Partial<User>
    ): Promise<User | null> {
        const user = await this.findById(id);
        if (!user) {
            return null;
        }
        Object.assign(user, updateData);
        return this.repo.save(user);
    }

    async deleteUser(id: string): Promise<boolean> {
        const result = await this.repo.delete(id);
        return result.affected !== 0;
    }
}

export default new UsersService();
