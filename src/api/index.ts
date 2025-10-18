import { Router } from 'express';

import { authRouter } from './auth/authRouter';
import { healthCheckRouter } from './health/healthCheckRouter';
import { userRouter } from './user/userRouter';
import { workspaceRouter } from './workspace/workspaceRouter';

const router = Router();

router.use('/users', userRouter);
router.use('/health-check', healthCheckRouter);
router.use('/auth', authRouter);
router.use('/workspaces', workspaceRouter);

export default router;
