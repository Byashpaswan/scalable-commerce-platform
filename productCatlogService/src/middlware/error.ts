import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const correlationId = req.correlationId || 'N/A';
  
  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    correlationId,
    message: err.message || 'Internal Server Error',
    stack: err.stack,
    details: err.errors || null
  }));

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors || undefined,
      correlationId
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid ${err.path}: ${err.value}`,
      correlationId
    });
  }

  if (err.code === 11000) {
    const key = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `Duplicate field value entered: ${key}. Please use another value!`,
      correlationId
    });
  }

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((el: any) => el.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors,
      correlationId
    });
  }

  const isProd = process.env.NODE_ENV === 'production';
  return res.status(500).json({
    success: false,
    message: isProd ? 'Internal Server Error' : err.message,
    correlationId
  });
};
