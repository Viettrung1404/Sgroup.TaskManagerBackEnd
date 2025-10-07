import { Router } from 'express';
import * as authController from './auth.controller.js';
import { ValidateMiddleware } from '../../common/middlewares/validate.middleware';

const router = Router();

router.post(
    '/register',
    ValidateMiddleware.validateCreateUser,
    authController.registerUser
);

router.post(
    '/login',
    ValidateMiddleware.validateCreateUser,
    authController.loginUser
);

export default router;
