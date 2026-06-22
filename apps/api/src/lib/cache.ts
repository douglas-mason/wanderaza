import Redis from 'ioredis';

let client: Redis | undefined;

function getClient(): Redis | undefined {
  const url = process.env.REDIS_URL;
  if (!url) return undefined;

  if (!client) {
    client = new Redis(url, { maxRetriesPerRequest: 1, lazyConnect: true });
    client.on('error', (err) => {
      console.error('Redis connection error', err);
    });
  }
  return client;
}

export async function getOrSetCache<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const redis = getClient();
  if (!redis) return fetcher();

  try {
    const cached = await redis.get(key);
    if (cached) return JSON.parse(cached) as T;
  } catch {
    return fetcher();
  }

  const fresh = await fetcher();

  try {
    await redis.set(key, JSON.stringify(fresh), 'EX', ttlSeconds);
  } catch {
    // best-effort cache write; search still succeeds without it
  }

  return fresh;
}
