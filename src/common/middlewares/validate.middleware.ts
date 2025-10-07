import { NextFunction, Request, Response } from 'express';
import Joi, { ValidationError } from 'joi';

type AuthenticatedRequest = Request & {
    user?: { role?: string };
};

export class ValidateMiddleware {
    private static async runValidation(
        schema: Joi.ObjectSchema | Joi.Schema,
        target: unknown,
        res: Response,
        next: NextFunction,
        options: Joi.AsyncValidationOptions = { abortEarly: false }
    ) {
        try {
            await schema.validateAsync(target, options);
            next();
        } catch (error) {
            if (error instanceof ValidationError) {
                const errors = error.details.map(({ context, message }) => ({
                    field: context?.key ?? 'unknown',
                    message,
                }));
                res.status(400).json({ errors });
                return;
            }
            next(error);
        }
    }

    static validateId = (req: Request, res: Response, next: NextFunction) => {
        const schema = Joi.object({
            id: Joi.number().integer().positive().required().messages({
                'number.base': 'ID phải là số',
                'number.integer': 'ID phải là số nguyên hợp lệ',
                'number.positive': 'ID phải lớn hơn 0',
                'any.required': 'ID là bắt buộc',
            }),
        });

        return this.runValidation(schema, req.params, res, next);
    };

    static validateEmail = (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const schema = Joi.object({
            email: Joi.string().email().required().messages({
                'string.email': 'Email không hợp lệ',
                'any.required': 'Email là bắt buộc',
            }),
        });

        return this.runValidation(schema, req.body, res, next);
    };

    static validateResetPassword = (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const schema = Joi.object({
            email: Joi.string().email().required().messages({
                'string.email': 'Email không hợp lệ',
                'any.required': 'Email là bắt buộc',
            }),
            password: Joi.string()
                .min(8)
                .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/)
                .required()
                .messages({
                    'string.min': 'Mật khẩu phải có ít nhất 8 ký tự',
                    'string.pattern.base':
                        'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số',
                    'any.required': 'Mật khẩu là bắt buộc',
                }),
            token: Joi.string().required().messages({
                'any.required': 'Token là bắt buộc',
            }),
        });

        return this.runValidation(schema, req.body, res, next);
    };

    static validateAdmin = (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ) => {
        if (req.user?.role !== 'admin') {
            res.status(403).json({
                success: false,
                message: 'You do not have permission to perform this action',
            });
            return;
        }
        next();
    };

    static validateUser = (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ) => {
        if (req.user?.role !== 'user') {
            res.status(403).json({
                success: false,
                message: 'You do not have permission to perform this action',
            });
            return;
        }
        next();
    };

    static validateCreateUser = (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const schema = Joi.object({
            password: Joi.string()
                .min(8)
                .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/)
                .required()
                .messages({
                    'string.min': 'Mật khẩu phải có ít nhất 8 ký tự',
                    'string.pattern.base':
                        'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số',
                    'any.required': 'Mật khẩu là bắt buộc',
                }),
            email: Joi.string().email().required().messages({
                'string.email': 'Email không hợp lệ',
                'any.required': 'Email là bắt buộc',
            }),
        });

        return this.runValidation(schema, req.body, res, next);
    };

    static validateUpdateUser = (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const schema = Joi.object({
            name: Joi.string()
                .min(3)
                .max(30)
                .pattern(/^[a-zA-Z\s]+$/),
            password: Joi.string()
                .min(8)
                .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/),
            email: Joi.string().email(),
        }).min(1);

        return this.runValidation(schema, req.body, res, next);
    };

    static validateCreatePoll = (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const schema = Joi.object({
            title: Joi.string().min(3).max(100).required().messages({
                'string.min': 'Tiêu đề phải có ít nhất 3 ký tự',
                'string.max': 'Tiêu đề không quá 100 ký tự',
                'any.required': 'Tiêu đề là bắt buộc',
            }),
            description: Joi.string().max(500).optional(),
            options: Joi.array()
                .items(
                    Joi.string().required().messages({
                        'any.required': 'Nội dung lựa chọn là bắt buộc',
                    })
                )
                .min(2)
                .required()
                .messages({
                    'array.min': 'Cần ít nhất 2 lựa chọn',
                    'any.required': 'Lựa chọn là bắt buộc',
                }),
            expiresAt: Joi.date().optional(),
            isLocked: Joi.boolean().optional().messages({
                'boolean.base': 'Trạng thái khóa phải là true hoặc false',
            }),
        });

        return this.runValidation(schema, req.body, res, next);
    };

    static validateUpdatePoll = (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const schema = Joi.object({
            title: Joi.string().min(3).max(100).messages({
                'string.min': 'Tiêu đề phải có ít nhất 3 ký tự',
                'string.max': 'Tiêu đề không quá 100 ký tự',
            }),
            description: Joi.string().max(500),
            options: Joi.array()
                .items(
                    Joi.string().required().messages({
                        'any.required': 'Nội dung lựa chọn là bắt buộc',
                    })
                )
                .min(2)
                .messages({
                    'array.min': 'Cần ít nhất 2 lựa chọn',
                }),
            expiresAt: Joi.date(),
        }).min(1);

        return this.runValidation(schema, req.body, res, next);
    };

    static validateVotePoll = (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const schema = Joi.object({
            optionId: Joi.string().hex().length(24).required().messages({
                'string.hex': 'ID lựa chọn phải là chuỗi hex hợp lệ',
                'string.length': 'ID lựa chọn phải có đúng 24 ký tự',
                'any.required': 'ID lựa chọn là bắt buộc',
            }),
        });

        return this.runValidation(schema, req.body, res, next);
    };

    static validateCreateOption = (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const schema = Joi.object({
            text: Joi.string().required().messages({
                'any.required': 'Nội dung lựa chọn là bắt buộc',
            }),
        });

        return this.runValidation(schema, req.body, res, next);
    };

    static validateUpdateOption = (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const schema = Joi.object({
            text: Joi.string().required().messages({
                'any.required': 'Nội dung lựa chọn là bắt buộc',
            }),
        });

        return this.runValidation(schema, req.body, res, next);
    };

    static validateRemoveOption = (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const schema = Joi.object({
            optionId: Joi.string().hex().length(24).required().messages({
                'string.hex': 'ID lựa chọn phải là chuỗi hex hợp lệ',
                'string.length': 'ID lựa chọn phải có đúng 24 ký tự',
                'any.required': 'ID lựa chọn là bắt buộc',
            }),
        });

        return this.runValidation(schema, req.body, res, next);
    };

    static validateVote = (req: Request, res: Response, next: NextFunction) => {
        if (!req.body?.optionId) {
            res.status(400).json({
                errors: [
                    {
                        field: 'optionId',
                        message:
                            'Field optionId need to be provided in the request body',
                    },
                ],
            });
            return;
        }

        const schema = Joi.object({
            optionId: Joi.string().hex().length(24).required().messages({
                'string.hex': 'ID lựa chọn phải là chuỗi hex hợp lệ',
                'string.length': 'ID lựa chọn phải có đúng 24 ký tự',
                'any.required': 'ID lựa chọn là bắt buộc',
            }),
        });

        return this.runValidation(schema, req.body, res, next);
    };
}
