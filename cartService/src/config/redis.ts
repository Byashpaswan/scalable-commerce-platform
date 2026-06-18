import Redis from 'ioredis';

export const redis = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379'),
});

redis.on('connect', () => {
  console.log('Redis connected successfully in Cart Service');
});

redis.on('error', (err) => {
  console.error('Redis error in Cart Service:', err);
});
