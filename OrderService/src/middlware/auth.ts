import { Request, Response, NextFunction } from 'express';
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
  const userId = req.headers['x-user-id'] as string;
  const userEmail = req.headers['x-user-email'] as string;
  const userRole = req.headers['x-user-role'] as string;

  if (!userId) {
    return next(new AppError('Authentication required for this resource', 401));
  }

  req.user = {
    id: userId,
    email: userEmail,
    role: userRole as any,
  };

  next();
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
