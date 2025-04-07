import { Core } from '@strapi/strapi';
import { getShopsRepository } from '../src/repositories/shop';
import { getService } from '../src/utils';
import bootstrap from '../src/bootstrap';

jest.mock('../src/repositories/shop');
jest.mock('../src/utils');

const getMockStrapi = (): Core.Strapi =>
  ({
    config: {
      get: jest.fn(),
    },
  }) as unknown as Core.Strapi;

const getMockShop = (overrides = {}) => ({
  id: 1,
  webhooks: [
    {
      id: 1,
      callbackUrl: null,
      shopifyId: null,
    },
  ],
  ...overrides,
});

const getMockShopsRepository = (overrides = {}) => ({
  findMany: jest.fn(),
  ...overrides,
});

const getMockShopifyService = () => ({
  init: jest.fn(),
});

describe('Bootstrap', () => {
  let strapi: Core.Strapi;
  let mockShopsRepository: ReturnType<typeof getMockShopsRepository>;
  let mockShopifyService: ReturnType<typeof getMockShopifyService>;

  beforeEach(() => {
    strapi = getMockStrapi();
    mockShopsRepository = getMockShopsRepository();
    mockShopifyService = getMockShopifyService();

    (getShopsRepository as jest.Mock).mockReturnValue(mockShopsRepository);
    (getService as jest.Mock).mockReturnValue(mockShopifyService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('when there are shops with incomplete webhooks', () => {
    it('should initialize shopify service with those shops', async () => {
      // Arrange
      const shops = [getMockShop()];
      mockShopsRepository.findMany.mockResolvedValue(shops);

      // Act
      await bootstrap({ strapi });

      // Assert
      expect(mockShopsRepository.findMany).toHaveBeenCalledWith({
        where: {
          webhooks: {
            $or: [{ callbackUrl: { $null: true } }, { shopifyId: { $null: true } }],
          },
        },
        populate: {
          webhooks: true,
        },
      });
      expect(mockShopifyService.init).toHaveBeenCalledWith(shops);
    });
  });

  describe('when there are no shops with incomplete webhooks', () => {
    it('should not initialize shopify service', async () => {
      // Arrange
      mockShopsRepository.findMany.mockResolvedValue([]);

      // Act
      await bootstrap({ strapi });

      // Assert
      expect(mockShopsRepository.findMany).toHaveBeenCalledWith({
        where: {
          webhooks: {
            $or: [{ callbackUrl: { $null: true } }, { shopifyId: { $null: true } }],
          },
        },
        populate: {
          webhooks: true,
        },
      });
      expect(mockShopifyService.init).not.toHaveBeenCalled();
    });
  });

  describe('when shop repository throws an error', () => {
    it('should propagate the error', async () => {
      // Arrange
      const error = new Error('Database error');
      mockShopsRepository.findMany.mockRejectedValue(error);

      // Act & Assert
      await expect(bootstrap({ strapi })).rejects.toThrow('Database error');
    });
  });
});
