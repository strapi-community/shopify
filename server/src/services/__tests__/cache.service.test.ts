import { Core } from '@strapi/strapi';
import Redis from 'ioredis';
import { LRUCache } from 'lru-cache';
import cacheService from '../cache.service';
import { getConfig } from '../../utils';

jest.mock('ioredis');
jest.mock('lru-cache');
jest.mock('../../utils', () => ({
  ...jest.requireActual('../../utils'),
  getConfig: jest.fn(),
  isMemoryEngine: jest.fn(),
  isRedisEngine: jest.fn(),
}));

const getMockStrapi = (config: any) =>
  ({
    config: {
      get: jest.fn().mockReturnValue(config),
    },
  }) as unknown as Core.Strapi;

describe('cache.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Memory Cache Engine', () => {
    const mockConfig = {
      engine: 'memory',
    };

    beforeEach(() => {
      (getConfig as jest.Mock).mockReturnValue(mockConfig);
      (require('../../utils').isMemoryEngine as jest.Mock).mockReturnValue(true);
      (require('../../utils').isRedisEngine as jest.Mock).mockReturnValue(false);
    });

    it('should initialize memory cache engine', () => {
      // Arrange
      const mockStrapi = getMockStrapi(mockConfig);
      const mockLruCache = {
        set: jest.fn(),
        get: jest.fn(),
        has: jest.fn(),
      };
      (LRUCache as unknown as jest.Mock).mockImplementation(() => mockLruCache);

      // Act
      const service = cacheService({ strapi: mockStrapi });

      // Assert
      expect(LRUCache).toHaveBeenCalledWith({ max: 500 });
      expect(service).toBeDefined();
    });

    it('should set value in memory cache', async () => {
      // Arrange
      const mockStrapi = getMockStrapi(mockConfig);
      const mockLruCache = {
        set: jest.fn(),
        get: jest.fn(),
        has: jest.fn(),
      };
      (LRUCache as unknown as jest.Mock).mockImplementation(() => mockLruCache);
      const service = cacheService({ strapi: mockStrapi });
      const key = 'test-key';
      const value = { test: 'value' };

      // Act
      await service.set(key, value);

      // Assert
      expect(mockLruCache.set).toHaveBeenCalledWith(key, value);
    });

    it('should get value from memory cache', async () => {
      // Arrange
      const mockStrapi = getMockStrapi(mockConfig);
      const expectedValue = { test: 'value' };
      const mockLruCache = {
        set: jest.fn(),
        get: jest.fn().mockReturnValue(expectedValue),
        has: jest.fn(),
      };
      (LRUCache as unknown as jest.Mock).mockImplementation(() => mockLruCache);
      const service = cacheService({ strapi: mockStrapi });
      const key = 'test-key';

      // Act
      const result = await service.get(key);

      // Assert
      expect(mockLruCache.get).toHaveBeenCalledWith(key);
      expect(result).toEqual(expectedValue);
    });

    it('should check if key exists in memory cache', async () => {
      // Arrange
      const mockStrapi = getMockStrapi(mockConfig);
      const mockLruCache = {
        set: jest.fn(),
        get: jest.fn(),
        has: jest.fn().mockReturnValue(true),
      };
      (LRUCache as unknown as jest.Mock).mockImplementation(() => mockLruCache);
      const service = cacheService({ strapi: mockStrapi });
      const key = 'test-key';

      // Act
      const result = await service.has(key);

      // Assert
      expect(mockLruCache.has).toHaveBeenCalledWith(key);
      expect(result).toBe(true);
    });
  });

  describe('Redis Cache Engine', () => {
    const mockConfig = {
      engine: 'redis',
      connection: {
        host: 'localhost',
        port: 6379,
        db: 0,
      },
    };

    beforeEach(() => {
      (getConfig as jest.Mock).mockReturnValue(mockConfig);
      (require('../../utils').isMemoryEngine as jest.Mock).mockReturnValue(false);
      (require('../../utils').isRedisEngine as jest.Mock).mockReturnValue(true);
    });

    it('should initialize Redis cache engine', () => {
      // Arrange
      const mockStrapi = getMockStrapi(mockConfig);
      const mockRedis = {
        set: jest.fn(),
        get: jest.fn(),
        exists: jest.fn(),
      };
      (Redis as unknown as jest.Mock).mockImplementation(() => mockRedis);

      // Act
      const service = cacheService({ strapi: mockStrapi });

      // Assert
      expect(Redis).toHaveBeenCalledWith(mockConfig.connection);
      expect(service).toBeDefined();
    });

    it('should set value in Redis cache', async () => {
      // Arrange
      const mockStrapi = getMockStrapi(mockConfig);
      const mockRedis = {
        set: jest.fn(),
        get: jest.fn(),
        exists: jest.fn(),
      };
      (Redis as unknown as jest.Mock).mockImplementation(() => mockRedis);
      const service = cacheService({ strapi: mockStrapi });
      const key = 'test-key';
      const value = { test: 'value' };

      // Act
      await service.set(key, value);

      // Assert
      expect(mockRedis.set).toHaveBeenCalledWith(key, JSON.stringify(value));
    });

    it('should get value from Redis cache', async () => {
      // Arrange
      const mockStrapi = getMockStrapi(mockConfig);
      const expectedValue = { test: 'value' };
      const mockRedis = {
        set: jest.fn(),
        get: jest.fn().mockResolvedValue(JSON.stringify(expectedValue)),
        exists: jest.fn(),
      };
      (Redis as unknown as jest.Mock).mockImplementation(() => mockRedis);
      const service = cacheService({ strapi: mockStrapi });
      const key = 'test-key';

      // Act
      const result = await service.get(key);

      // Assert
      expect(mockRedis.get).toHaveBeenCalledWith(key);
      expect(result).toEqual(expectedValue);
    });

    it('should check if key exists in Redis cache', async () => {
      // Arrange
      const mockStrapi = getMockStrapi(mockConfig);
      const mockRedis = {
        set: jest.fn(),
        get: jest.fn(),
        exists: jest.fn().mockResolvedValue(1),
      };
      (Redis as unknown as jest.Mock).mockImplementation(() => mockRedis);
      const service = cacheService({ strapi: mockStrapi });
      const key = 'test-key';

      // Act
      const result = await service.has(key);

      // Assert
      expect(mockRedis.exists).toHaveBeenCalledWith(key);
      expect(result).toBe(true);
    });
  });

  describe('Error Cases', () => {
    it('should throw error when cache engine is not defined', () => {
      // Arrange
      const mockConfig = {};
      (getConfig as jest.Mock).mockReturnValue(mockConfig);
      const mockStrapi = getMockStrapi(mockConfig);

      // Act & Assert
      expect(() => cacheService({ strapi: mockStrapi })).toThrow('Cache engine is not defined');
    });

    it('should throw error when cache engine is not supported', () => {
      // Arrange
      const mockConfig = {
        engine: 'unsupported',
      };
      (getConfig as jest.Mock).mockReturnValue(mockConfig);
      (require('../../utils').isMemoryEngine as jest.Mock).mockReturnValue(false);
      (require('../../utils').isRedisEngine as jest.Mock).mockReturnValue(false);
      const mockStrapi = getMockStrapi(mockConfig);

      // Act & Assert
      expect(() => cacheService({ strapi: mockStrapi })).toThrow('Unsupported cache engine');
    });
  });
});
