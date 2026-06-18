import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379'),
});

export const rateLimiter = (limit: number, windowSeconds: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `ratelimit:${ip}`;

    try {
      const requests = await redis.incr(key);

      if (requests === 1) {
        await redis.expire(key, windowSeconds);
      }

      if (requests > limit) {
        return res.status(429).json({
          success: false,
          message: 'Too many requests. Please try again later.',
        });
      }

      next();
    } catch (err) {
      console.error('Redis Rate Limiting Error:', err);
      next();
    }
  };
};
