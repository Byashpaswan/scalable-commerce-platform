import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379'),
});

redis.on('connect', () => {
  console.log('Redis connected successfully in Product Service');
});

redis.on('error', (err) => {
  console.error('Redis error in Product Service:', err);
});

export class CacheService {
  public static async get(key: string): Promise<any | null> {
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      console.error('Redis Get Error:', err);
      return null;
    }
  }

  public static async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
    try {
      await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (err) {
      console.error('Redis Set Error:', err);
    }
  }

  public static async del(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (err) {
      console.error('Redis Del Error:', err);
    }
  }

  public static async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (err) {
      console.error('Redis Invalidate Pattern Error:', err);
    }
  }
}
