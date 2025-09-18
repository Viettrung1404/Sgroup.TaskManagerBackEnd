import { Router, Request, Response } from 'express';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Health
 *   description: API kiểm tra trạng thái server
 */

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Kiểm tra server có hoạt động không
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server đang chạy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
router.get('/', (req: Request, res: Response) => {
    res.json({ status: 'ok' });
});

export default router;
