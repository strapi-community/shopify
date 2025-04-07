import { Core } from '@strapi/strapi';
import { ShopWithWebhooks } from '../../repositories/validators';
import shopifyService from '../shopify.service';
import { getService } from '../../utils';
import { WebhookSubscriptionTopic } from '../../@types/shopify';
import { getWebhookRepository } from '../../repositories/webhook';

jest.mock('../../utils/getService', () => ({
  ...jest.requireActual('../../utils/getService'),
  getService: jest.fn(),
}));

jest.mock('../../repositories/webhook', () => ({
  ...jest.requireActual('../../repositories/webhook'),
  getWebhookRepository: jest.fn(),
}));

const getMockStrapi = (): Core.Strapi =>
  ({
    service: jest.fn(),
    services: {},
  }) as unknown as Core.Strapi;

const getMockWebhookService = () => ({
  create: jest.fn(),
});

const getMockShopService = () => ({
  getGQLClient: jest.fn().mockResolvedValue({
    request: jest.fn().mockResolvedValue({
      data: {
        nodes: [],
      },
    }),
  }),
});

const getMockCacheService = () => ({
  get: jest.fn(),
  set: jest.fn(),
});

const getMockWebhookRepository = () => ({
  update: jest.fn(),
});

const getMockShopifyService = (strapi: Core.Strapi) => {
  return shopifyService({ strapi });
};

describe('shopify.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('init', () => {
    it('should initialize webhooks for all shops', async () => {
      // Arrange
      const mockStrapi = getMockStrapi();
      const webhookService = getMockWebhookService();
      const webhookRepository = getMockWebhookRepository();

      const shop: ShopWithWebhooks = {
        address: 'test-shop.myshopify.com',
        webhooks: [
          {
            topic: WebhookSubscriptionTopic.ProductsCreate,
            service: 'plugin::shopify.webhook',
            method: 'createProduct',
          },
        ],
      };
      const mockShopsConfig: ShopWithWebhooks[] = [shop];

      const webhook = {
        id: 1,
        topic: WebhookSubscriptionTopic.ProductsCreate,
        service: 'plugin::shopify.webhook',
        method: 'createProduct',
      };
      const mockWebhooks = [webhook];

      (getService as jest.Mock).mockImplementation((strapi, name) => {
        if (name === 'webhook') return webhookService;
        return {};
      });

      (getWebhookRepository as jest.Mock).mockReturnValue(webhookRepository);
      webhookService.create.mockResolvedValue(mockWebhooks);
      webhookRepository.update.mockResolvedValue({});

      const service = getMockShopifyService(mockStrapi);

      // Act
      await service.init(mockShopsConfig);

      // Assert
      expect(webhookService.create).toHaveBeenCalledWith(shop.address, shop.webhooks);
      expect(webhookRepository.update).toHaveBeenCalledWith({ id: webhook.id }, webhook);
    });
  });

  describe('getProductsById', () => {
    it('should return products from cache when available', async () => {
      // Arrange
      const mockStrapi = getMockStrapi();
      const shopService = getMockShopService();
      const cacheService = getMockCacheService();

      const firstProduct = { id: '1', title: 'Product 1' };
      const secondProduct = { id: '2', title: 'Product 2' };
      const mockProducts = [firstProduct, secondProduct];

      (getService as jest.Mock).mockImplementation((strapi, name) => {
        if (name === 'shop') return shopService;
        if (name === 'cache') return cacheService;
        return {};
      });

      cacheService.get.mockImplementation((id) => mockProducts.find((p) => p.id === id));

      const service = getMockShopifyService(mockStrapi);

      const vendorName = 'test-vendor';
      // Act
      const result = await service.getProductsById(
        vendorName,
        mockProducts.map((p) => p.id)
      );

      // Assert
      expect(result.size).toBe(2);
      expect(result.get('1')).toEqual(firstProduct);
      expect(result.get('2')).toEqual(secondProduct);
      expect(shopService.getGQLClient).toHaveBeenCalledWith(vendorName);
    });

    it('should fetch missing products from Shopify and cache them', async () => {
      // Arrange
      const mockStrapi = getMockStrapi();
      const mockCachedProduct = { id: '1', title: 'Product 1' };
      const secondProduct = { id: '2', title: 'Product 2' };
      const mockGQLClient = {
        request: jest.fn().mockResolvedValue({
          data: {
            nodes: [secondProduct],
          },
        }),
      };
      const shopService = {
        getGQLClient: jest.fn().mockResolvedValue(mockGQLClient),
      };
      const cacheService = getMockCacheService();

      (getService as jest.Mock).mockImplementation((strapi, name) => {
        if (name === 'shop') return shopService;
        if (name === 'cache') return cacheService;
        return {};
      });

      cacheService.get.mockImplementation((id) => (id === '1' ? mockCachedProduct : null));

      const service = getMockShopifyService(mockStrapi);

      const vendorName = 'test-vendor';
      // Act
      const result = await service.getProductsById(vendorName, [
        mockCachedProduct.id,
        secondProduct.id,
      ]);

      // Assert
      expect(result.size).toBe(2);
      expect(result.get(mockCachedProduct.id)).toEqual(mockCachedProduct);
      expect(result.get(secondProduct.id)).toEqual(secondProduct);
      expect(shopService.getGQLClient).toHaveBeenCalledWith(vendorName);
      expect(cacheService.set).toHaveBeenCalledWith(secondProduct.id, secondProduct);
    });
  });

  describe('searchProducts', () => {
    it('should return cached search results when available', async () => {
      // Arrange
      const mockStrapi = getMockStrapi();
      const shopService = getMockShopService();
      const cacheService = getMockCacheService();

      const product = { id: '1', title: 'Product 1' };
      const mockSearchResults = {
        products: [product],
        pageInfo: { hasNextPage: false, endCursor: null },
      };

      (getService as jest.Mock).mockImplementation((strapi, name) => {
        if (name === 'shop') return shopService;
        if (name === 'cache') return cacheService;
        return {};
      });

      cacheService.get.mockResolvedValue(mockSearchResults);

      const service = getMockShopifyService(mockStrapi);

      const vendorName = 'test-vendor';
      // Act
      const result = await service.searchProducts(vendorName, 'test query');

      // Assert
      expect(result).toEqual(mockSearchResults);
      expect(shopService.getGQLClient).not.toHaveBeenCalled();
    });

    it('should fetch and cache search results when not in cache', async () => {
      // Arrange
      const mockStrapi = getMockStrapi();
      const product = { id: '1', title: 'Product 1' };
      const mockGQLClient = {
        request: jest.fn().mockResolvedValue({
          data: {
            products: {
              nodes: [product],
              pageInfo: { hasNextPage: false, endCursor: null },
            },
          },
        }),
      };
      const shopService = {
        getGQLClient: jest.fn().mockResolvedValue(mockGQLClient),
      };
      const cacheService = getMockCacheService();

      const mockSearchResults = {
        products: [product],
        pageInfo: { hasNextPage: false, endCursor: null },
      };

      (getService as jest.Mock).mockImplementation((strapi, name) => {
        if (name === 'shop') return shopService;
        if (name === 'cache') return cacheService;
        return {};
      });

      cacheService.get.mockResolvedValue(null);

      const service = getMockShopifyService(mockStrapi);

      const vendorName = 'test-vendor';
      const searchQuery = 'test query';
      // Act
      const result = await service.searchProducts(vendorName, searchQuery);

      // Assert
      expect(result).toEqual(mockSearchResults);
      expect(shopService.getGQLClient).toHaveBeenCalledWith(vendorName);
      expect(cacheService.set).toHaveBeenCalledWith(
        `${vendorName}|${searchQuery}`,
        mockSearchResults
      );
      expect(cacheService.set).toHaveBeenCalledWith(product.id, product);
    });
  });
});
