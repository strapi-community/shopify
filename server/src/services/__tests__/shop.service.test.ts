import { Core } from '@strapi/strapi';
import { LATEST_API_VERSION, shopifyApi } from '@shopify/shopify-api';
import shopService from '../shop.service';
import { getShopsRepository } from '../../repositories/shop';
import { getHost } from '../../utils';
import { StrapiContext } from '../../@types';

jest.mock('@shopify/shopify-api');
jest.mock('../../repositories/shop');
jest.mock('../../utils');

const getMockStrapi = (): Core.Strapi =>
  ({
    config: {
      get: jest.fn(),
    },
  }) as unknown as Core.Strapi;

const getMockShopConfig = (overrides = {}) => ({
  vendor: 'test-vendor',
  apiKey: 'test-api-key',
  apiSecretKey: 'test-api-secret',
  adminApiAccessToken: 'test-admin-token',
  address: 'https://test.myshopify.com',
  ...overrides,
});

const getMockShopifyApi = (overrides = {}) => ({
  session: {
    customAppSession: jest.fn().mockReturnValue({
      isExpired: jest.fn().mockReturnValue(false),
    }),
  },
  clients: {
    Graphql: jest.fn(),
    Rest: jest.fn(),
  },
  ...overrides,
});

const getMockShopsRepository = (overrides = {}) => ({
  findOne: jest.fn(),
  ...overrides,
});

const getExpectedShopifyApiParams = (config: ReturnType<typeof getMockShopConfig>) => ({
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: false,
  apiKey: config.apiKey,
  apiSecretKey: config.apiSecretKey,
  adminApiAccessToken: config.adminApiAccessToken,
  scopes: ['write_products', 'read_products'],
  hostName: 'localhost',
  hostScheme: 'http',
  isCustomStoreApp: true,
});

describe('shop.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getHost as jest.Mock).mockReturnValue('localhost');
  });

  describe('getConfig', () => {
    it('should return shop config for given vendor', async () => {
      // Arrange
      const mockConfig = getMockShopConfig();
      const mockShopsRepository = getMockShopsRepository({
        findOne: jest.fn().mockResolvedValue(mockConfig),
      });
      (getShopsRepository as jest.Mock).mockReturnValue(mockShopsRepository);

      const strapi = getMockStrapi();
      const service = shopService({ strapi });

      // Act
      const result = await service.getConfig('test-vendor');

      // Assert
      expect(result).toEqual(mockConfig);
      expect(mockShopsRepository.findOne).toHaveBeenCalledWith({
        where: { vendor: 'test-vendor' },
      });
    });
  });

  describe('getOrCreateWithConfig', () => {
    it('should return cached shop if exists', () => {
      // Arrange
      const mockConfig = getMockShopConfig();
      const mockShopifyApi = getMockShopifyApi();
      (shopifyApi as jest.Mock).mockReturnValue(mockShopifyApi);

      const strapi = getMockStrapi();
      const service = shopService({ strapi });
      service.getOrCreateWithConfig(mockConfig); // First call to populate cache

      // Act
      const result = service.getOrCreateWithConfig(mockConfig);

      // Assert
      expect(result).toBeDefined();
      expect(shopifyApi).toHaveBeenCalledTimes(1); // Should not create new instance
      expect(shopifyApi).toHaveBeenCalledWith(getExpectedShopifyApiParams(mockConfig));
    });

    it('should create new shop instance if not cached', () => {
      // Arrange
      const mockConfig = getMockShopConfig();
      const mockShopifyApi = getMockShopifyApi();
      (shopifyApi as jest.Mock).mockReturnValue(mockShopifyApi);

      const strapi = getMockStrapi();
      const service = shopService({ strapi });

      // Act
      const result = service.getOrCreateWithConfig(mockConfig);

      // Assert
      expect(result).toBeDefined();
      expect(shopifyApi).toHaveBeenCalledWith(getExpectedShopifyApiParams(mockConfig));
    });
  });

  describe('getOrCreateShop', () => {
    it('should return cached shop if exists', async () => {
      // Arrange
      const mockConfig = getMockShopConfig();
      const mockShopsRepository = getMockShopsRepository({
        findOne: jest.fn().mockResolvedValue(mockConfig),
      });
      (getShopsRepository as jest.Mock).mockReturnValue(mockShopsRepository);

      const mockShopifyApi = getMockShopifyApi();
      (shopifyApi as jest.Mock).mockReturnValue(mockShopifyApi);

      const strapi = getMockStrapi();
      const service = shopService({ strapi });
      await service.getOrCreateShop('test-vendor'); // First call to populate cache

      // Act
      const result = await service.getOrCreateShop('test-vendor');

      // Assert
      expect(result).toBeDefined();
      expect(mockShopsRepository.findOne).toHaveBeenCalledTimes(1); // Should not query again
      expect(shopifyApi).toHaveBeenCalledWith(getExpectedShopifyApiParams(mockConfig));
    });

    it('should throw error if shop not found', async () => {
      // Arrange
      const mockShopsRepository = getMockShopsRepository({
        findOne: jest.fn().mockResolvedValue(null),
      });
      (getShopsRepository as jest.Mock).mockReturnValue(mockShopsRepository);

      const strapi = getMockStrapi();
      const service = shopService({ strapi });

      // Act & Assert
      await expect(service.getOrCreateShop('test-vendor')).rejects.toThrow('Shop not found');
      expect(shopifyApi).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove shop and session from cache', () => {
      // Arrange
      const mockConfig = getMockShopConfig();
      const mockShopifyApi = getMockShopifyApi();
      (shopifyApi as jest.Mock).mockReturnValue(mockShopifyApi);

      const strapi = getMockStrapi();
      const service = shopService({ strapi });
      service.getOrCreateWithConfig(mockConfig); // Populate cache

      // Act
      service.remove('test-vendor');

      // Assert
      const result = service.getOrCreateWithConfig(mockConfig);
      expect(shopifyApi).toHaveBeenCalledTimes(2); // Should create new instance
      expect(shopifyApi).toHaveBeenCalledWith(getExpectedShopifyApiParams(mockConfig));
    });
  });

  describe('getOrCreateSession', () => {
    it('should return cached session if not expired', async () => {
      // Arrange
      const mockConfig = getMockShopConfig();
      const mockShopifyApi = getMockShopifyApi();
      (shopifyApi as jest.Mock).mockReturnValue(mockShopifyApi);

      const strapi = getMockStrapi();
      const service = shopService({ strapi });
      service.getOrCreateWithConfig(mockConfig); // Populate cache

      // Act
      const result = await service.getOrCreateSession('test-vendor');

      // Assert
      expect(result).toBeDefined();
      expect(mockShopifyApi.session.customAppSession).toHaveBeenCalledWith('test.myshopify.com');
      expect(shopifyApi).toHaveBeenCalledWith(getExpectedShopifyApiParams(mockConfig));
    });

    it('should create new session if cached one is expired', async () => {
      // Arrange
      const mockConfig = getMockShopConfig();
      const mockShopifyApi = getMockShopifyApi({
        session: {
          customAppSession: jest.fn().mockReturnValue({
            isExpired: jest.fn().mockReturnValue(true),
          }),
        },
      });
      (shopifyApi as jest.Mock).mockReturnValue(mockShopifyApi);

      const strapi = getMockStrapi();
      const service = shopService({ strapi });
      service.getOrCreateWithConfig(mockConfig); // Populate cache

      // Act
      const result = await service.getOrCreateSession('test-vendor');

      // Assert
      expect(result).toBeDefined();
      expect(mockShopifyApi.session.customAppSession).toHaveBeenCalledWith('test.myshopify.com');
      expect(shopifyApi).toHaveBeenCalledWith(getExpectedShopifyApiParams(mockConfig));
    });
  });

  describe('getGQLClient', () => {
    it('should return GraphQL client with session', async () => {
      // Arrange
      const mockConfig = getMockShopConfig();
      const mockShopsRepository = getMockShopsRepository({
        findOne: jest.fn().mockResolvedValue(mockConfig),
      });
      (getShopsRepository as jest.Mock).mockReturnValue(mockShopsRepository);

      const mockShopifyApi = getMockShopifyApi();
      (shopifyApi as jest.Mock).mockReturnValue(mockShopifyApi);

      const strapi = getMockStrapi();
      const service = shopService({ strapi });

      // Act
      const result = await service.getGQLClient('test-vendor');

      // Assert
      expect(result).toBeDefined();
      expect(mockShopifyApi.clients.Graphql).toHaveBeenCalled();
      expect(shopifyApi).toHaveBeenCalledWith(getExpectedShopifyApiParams(mockConfig));
    });
  });

  describe('getRestClient', () => {
    it('should return REST client with session', async () => {
      // Arrange
      const mockConfig = getMockShopConfig();
      const mockShopsRepository = getMockShopsRepository({
        findOne: jest.fn().mockResolvedValue(mockConfig),
      });
      (getShopsRepository as jest.Mock).mockReturnValue(mockShopsRepository);

      const mockShopifyApi = getMockShopifyApi();
      (shopifyApi as jest.Mock).mockReturnValue(mockShopifyApi);

      const strapi = getMockStrapi();
      const service = shopService({ strapi });

      // Act
      const result = await service.getRestClient('test-vendor');

      // Assert
      expect(result).toBeDefined();
      expect(mockShopifyApi.clients.Rest).toHaveBeenCalled();
      expect(shopifyApi).toHaveBeenCalledWith(getExpectedShopifyApiParams(mockConfig));
    });
  });
});
