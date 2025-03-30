import { getConfig } from '../getConfig';
import { Core } from '@strapi/strapi';
import { PluginConfig, RedisEngine } from '../../config/schema';

const getMockConfig = (): PluginConfig => ({
  host: 'https://example.com',
  engine: 'memory',
});

const getStrapiMock = (mockConfig: PluginConfig = getMockConfig()) => {
  return {
    config: {
      get: jest.fn().mockReturnValue(mockConfig),
    },
  } as unknown as Core.Strapi;
};

const isRedisEngine = (config: PluginConfig): config is RedisEngine & { host: string } => {
  return config.engine === 'redis';
};

describe('getConfig', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return the plugin configuration', () => {
    const mockConfig = getMockConfig();
    const mockStrapi = getStrapiMock(mockConfig);
    const result = getConfig(mockStrapi);

    expect(mockStrapi.config.get).toHaveBeenCalledWith('plugin::shopify');
    expect(result).toBe(mockConfig);
  });

  it('should return the correct configuration structure', () => {
    const mockConfig = getMockConfig();
    const mockStrapi = getStrapiMock(mockConfig);
    const result = getConfig(mockStrapi);

    expect(result).toHaveProperty('host');
    expect(result).toHaveProperty('engine');
    expect(result.host).toBe('https://example.com');
    expect(result.engine).toBe('memory');
  });

  it('should work with redis engine configuration', () => {
    const redisConfig: PluginConfig = {
      host: 'https://example.com',
      engine: 'redis',
      connection: {
        host: 'localhost',
        port: 6379,
        db: 0,
        password: 'password',
        username: 'user',
      },
    } as RedisEngine & { host: string };
    const mockStrapi = getStrapiMock(redisConfig);
    const result = getConfig(mockStrapi);

    expect(result).toHaveProperty('host');
    expect(result).toHaveProperty('engine');
    expect(result.engine).toBe('redis');

    if (isRedisEngine(result)) {
      expect(result.connection).toHaveProperty('host');
      expect(result.connection).toHaveProperty('port');
      expect(result.connection).toHaveProperty('db');
      expect(result.connection).toHaveProperty('password');
      expect(result.connection).toHaveProperty('username');
    }
  });
});
