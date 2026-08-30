import Redis from 'ioredis';

export function createRedisConnection(): Redis {
  const host = process.env.REDIS_HOST || 'localhost';
  const port = Number(process.env.REDIS_PORT) || 6379;
  const password = process.env.REDIS_PASSWORD || undefined;

  const redis = new Redis({
    host,
    port,
    password,
    maxRetriesPerRequest: null,
  });

  redis.on('connect', () => {
    console.log(`[Redis] Connected successfully to ${host}:${port}`);
  });

  redis.on('error', (err) => {
    console.error('[Redis] Error:', err.message);
  });

  return redis;
}
