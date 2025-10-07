import { Router, ErrorRequestHandler } from 'express';

const router = Router();

interface HttpError extends Error {
    status?: number;
    statusCode?: number;
}

const errorHandler: ErrorRequestHandler = (
    err: HttpError,
    _req,
    res,
    _next
) => {
    const statusCode = err.statusCode ?? err.status ?? 500;
    const response: { status: number; message: string; stack?: string } = {
        status: statusCode,
        message: err.message ?? 'Internal server error',
    };

    if (process.env.NODE_ENV !== 'production' && err.stack) {
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
};

router.use(errorHandler);

export default router;
