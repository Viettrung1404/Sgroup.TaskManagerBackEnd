import { Router } from 'express';
import usersController from './users.controller';

const route = Router();

/**
 * @swagger
 * /apis/users:
 *   get:
 *     summary: Lấy danh sách user
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Trả về danh sách user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: number
 *                   name:
 *                     type: string
 */

route.route('/').get(usersController.getUsers);

export default route;
