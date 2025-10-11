import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Request, Response, Router } from 'express';
import { z } from 'zod';

import { createApiResponse } from '@/api-docs/openAPIResponseBuilders';
import {
    ResponseStatus,
    ServiceResponse,
} from '@/common/models/serviceResponse';
import { handleServiceResponse } from '@/common/utils/httpHandlers';

// Tạo một OpenAPIRegistry để đăng ký các endpoint
export const healthCheckRegistry = new OpenAPIRegistry();

export const healthCheckRouter: Router = (() => {
    const router = express.Router();

    // Đăng ký endpoint vào OpenAPIRegistry
    healthCheckRegistry.registerPath({
        method: 'get',
        path: '/health-check',
        tags: ['Health Check'],
        responses: createApiResponse(z.null(), 'Success'),
    });

    // Định nghĩa endpoint kiểm tra sức khỏe dịch vụ
    router.get('/', (_req: Request, res: Response) => {
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Success,
            'Service is healthy',
            null,
            200
        );
        handleServiceResponse(serviceResponse, res);
    });

    return router;
})();
