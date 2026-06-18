import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/errors';

export interface IUserPayload {
  id: string;
  role: 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN' | 'SUPPORT' | 'SELLER';
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: IUserPayload;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authentication token missing or invalid', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_ACCESS_SECRET || 'your_super_secret_jwt_access_key_123!';
    const decoded = jwt.verify(token, secret) as IUserPayload;
    req.user = decoded;
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Token has expired', 401));
    }
    return next(new AppError('Invalid token', 401));
  }
};

export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('User not authenticated', 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};
