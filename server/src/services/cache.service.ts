import { Core } from '@strapi/strapi';
import Redis from 'ioredis';
import { LRUCache } from 'lru-cache';
import { StrapiContext } from '../@types';
import { getConfig, isMemoryEngine, isRedisEngine } from '../utils';

const getEngine = (strapi: Core.Strapi) => {
  const config = getConfig(strapi);
  if (!config.engine) {
    throw new Error('Cache engine is not defined');
  }
  if (isMemoryEngine(config)) {
    const lruCache = new LRUCache({
      max: 500,
      maxSize: 5000,
    });
    return {
      set: async <T>(key: string, value: T): Promise<void> => {
        lruCache.set(key, value);
      },
      get: async <T>(key: string): Promise<T | undefined> => {
        const value = lruCache.get(key);
        return value as T;
      },
    };
  }
  if (isRedisEngine(config)) {
    // const Redis = require('ioredis');
    const cache = new Redis(config.connection);
    return {
      set: async <T>(key: string, value: T): Promise<void> => {
        await cache.set(key, JSON.stringify(value));
      },
      get: async <T>(key: string): Promise<T | undefined> => {
        const value = await cache.get(key);
        return JSON.parse(value);
      },
    };
  }
  throw new Error('Unsupported cache engine');
};

type CacheService = {
  get: <T>(key: string) => Promise<T | undefined>;
  set: <T>(key: string, value: T) => Promise<void>;
};

const cacheService = ({ strapi }: StrapiContext): CacheService => {
  return getEngine(strapi);
};

export default cacheService;
