import { NextFunction, Request, Response } from 'express';
import usersService from './users.service';

class UsersController {
    async getUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const users = await usersService.getUsers();
            // Lấy id, name, email của users
            const filteredUsers = users.map((user) => ({
                id: user.id,
                name: user.name,
                email: user.email,
            }));
            res.status(200).json(filteredUsers);
        } catch (error) {
            next(error);
        }
    }
}

export default new UsersController();
