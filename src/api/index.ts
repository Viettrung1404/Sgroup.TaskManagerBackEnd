import { Router } from 'express';

import { authRouter } from './auth/authRouter';
import { healthCheckRouter } from './health/healthCheckRouter';
import { userRouter } from './user/userRouter';

const router = Router();

router.use('/users', userRouter);
router.use('/health-check', healthCheckRouter);
router.use('/auth', authRouter);

export default router;
