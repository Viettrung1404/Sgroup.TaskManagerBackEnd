import { Router } from 'express';
import healthRouter from './health/health.router';
import usersRouter from './users/users.router';

const router = Router();

router.use('/users', usersRouter);
router.use('/healthy-check', healthRouter);

export default router;
