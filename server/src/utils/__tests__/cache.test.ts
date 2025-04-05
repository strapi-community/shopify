import { isRedisEngine, isMemoryEngine } from '../cache';
import { MemoryEngine, RedisEngine } from '../../config/schema';

describe('cacheDetection', () => {
  describe('isRedisEngine', () => {
    it('should return true for Redis engine config', () => {
      const redisConfig: RedisEngine = {
        engine: 'redis',
        connection: {
          host: 'localhost',
          port: 6379,
          db: 0,
        },
      };
      expect(isRedisEngine(redisConfig)).toBe(true);
    });

    it('should return false for Memory engine config', () => {
      const memoryConfig: MemoryEngine = {
        engine: 'memory',
      };
      expect(isRedisEngine(memoryConfig)).toBe(false);
    });
  });

  describe('isMemoryEngine', () => {
    it('should return true for Memory engine config', () => {
      const memoryConfig: MemoryEngine = {
        engine: 'memory',
      };
      expect(isMemoryEngine(memoryConfig)).toBe(true);
    });

    it('should return false for Redis engine config', () => {
      const redisConfig: RedisEngine = {
        engine: 'redis',
        connection: {
          host: 'localhost',
          port: 6379,
          db: 0,
        },
      };
      expect(isMemoryEngine(redisConfig)).toBe(false);
    });
  });
});
