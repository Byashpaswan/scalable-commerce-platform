import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AppError } from '../utils/errors';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true
    });

    if (error) {
      const errorDetails = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      return next(new AppError('Validation failed', 400, errorDetails));
    }

    req.body = value;
    next();
  };
};
