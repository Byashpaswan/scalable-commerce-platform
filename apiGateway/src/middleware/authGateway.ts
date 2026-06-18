import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authGateway = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const secret = process.env.JWT_ACCESS_SECRET || 'your_super_secret_jwt_access_key_123!';
      const decoded = jwt.verify(token, secret) as any;
      
      req.headers['x-user-id'] = decoded.id;
      req.headers['x-user-email'] = decoded.email;
      req.headers['x-user-role'] = decoded.role;
    } catch (err) {
      console.warn('Gateway: JWT token validation failed');
    }
  }

  next();
};
