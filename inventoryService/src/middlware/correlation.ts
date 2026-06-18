import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

declare global {
  namespace Express {
    interface Request {
      correlationId?: string;
    }
  }
}

export const correlationIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const correlationIdHeader = req.headers['x-correlation-id'];
  const correlationId = Array.isArray(correlationIdHeader) 
    ? correlationIdHeader[0] 
    : (correlationIdHeader || randomUUID());

  req.correlationId = correlationId;
  res.setHeader('x-correlation-id', correlationId);
  next();
};
