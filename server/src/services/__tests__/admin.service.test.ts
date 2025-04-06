import { Core } from '@strapi/strapi';
import { StrapiContext } from '../../@types';
import { BadRequestException } from '../../exceptions/BadRequestException';
import { WebhookSubscriptionTopic, WebhookSubscriptionFormat } from '../../@types/shopify';
import { Webhook, WebhookData } from '../../repositories/validators';
import { ShopifyShopWithId } from '../../validators/admin.validator';
import adminService from '../admin.service';

jest.mock('../../repositories/shop', () => ({
  ...jest.requireActual('../../repositories/shop'),
  getShopsRepository: jest.fn(),
}));

jest.mock('../../repositories/webhook', () => ({
  ...jest.requireActual('../../repositories/webhook'),
  getWebhookRepository: jest.fn(),
}));

jest.mock('../../utils/getService', () => ({
  ...jest.requireActual('../../utils/getService'),
  getService: jest.fn(),
}));

const getMockShop = (overrides: Partial<ShopifyShopWithId> = {}): ShopifyShopWithId => ({
  id: 1,
  vendor: 'test-vendor',
  apiKey: 'test123456',
  apiSecretKey: 'secret123456',
  adminApiAccessToken: 'token123456',
  isActive: true,
  webhooks: [],
  ...overrides,
});

const getMockStrapi = (): Core.Strapi =>
  ({
    db: {
      transaction: jest.fn((callback) => callback()),
    },
    service: jest.fn(),
    services: {},
  }) as unknown as Core.Strapi;

const getMockShopsRepository = () => ({
  findMany: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  count: jest.fn(),
  restore: jest.fn(),
});

const getMockWebhookRepository = () => ({
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  removeMany: jest.fn(),
});

const getMockWebhookService = () => ({
  create: jest.fn(),
  remove: jest.fn(),
});

const getMockShopService = () => ({
  remove: jest.fn(),
});

const getAdminService = (strapi: Core.Strapi) => {
  return adminService({ strapi });
};

const getMockWebhook = (overrides: Partial<Webhook> = {}): Webhook => ({
  id: 1,
  documentId: 'test',
  shopifyId: 'webhook-1',
  topic: WebhookSubscriptionTopic.ProductsCreate,
  format: WebhookSubscriptionFormat.Json,
  callbackUrl: 'test',
  service: 'test-service',
  method: 'test-method',
  ...overrides,
});

const getMockWebhookData = (overrides: Partial<WebhookData> = {}): WebhookData => ({
  id: 1,
  shopifyId: 'webhook-1',
  ...overrides,
});

const setupUpdateShopTest = () => {
  const strapi = getMockStrapi();
  const shopsRepository = getMockShopsRepository();
  const webhookRepository = getMockWebhookRepository();
  const webhookService = getMockWebhookService();

  const { getShopsRepository } = require('../../repositories/shop');
  const { getWebhookRepository } = require('../../repositories/webhook');
  const { getService } = require('../../utils/getService');

  getShopsRepository.mockReturnValue(shopsRepository);
  getWebhookRepository.mockReturnValue(webhookRepository);
  getService.mockImplementation((strapi, name) => {
    if (name === 'webhook') return webhookService;
    return {};
  });

  const adminService = getAdminService(strapi);

  return {
    strapi,
    shopsRepository,
    webhookRepository,
    webhookService,
    adminService,
  };
};

describe('admin.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('settings', () => {
    describe('getSettings', () => {
      it('should return settings with hidden sensitive data', async () => {
        // Arrange
        const strapi = getMockStrapi();
        const shopsRepository = getMockShopsRepository();
        const mockShops = [getMockShop()];
        shopsRepository.findMany.mockResolvedValue(mockShops);

        const { getShopsRepository } = require('../../repositories/shop');
        getShopsRepository.mockReturnValue(shopsRepository);

        const adminService = getAdminService(strapi);

        // Act
        const result = await adminService.settings.getSettings();

        // Assert
        expect(result).toEqual({
          shops: [
            {
              id: 1,
              vendor: 'test-vendor',
              apiKey: 'tes*****6',
              apiSecretKey: 'sec*****6',
              adminApiAccessToken: 'tok*****6',
              isActive: true,
              webhooks: [],
            },
          ],
        });
      });

      it('should return settings with visible sensitive data when hideSensitiveData is false', async () => {
        // Arrange
        const strapi = getMockStrapi();
        const shopsRepository = getMockShopsRepository();
        const mockShops = [getMockShop()];
        shopsRepository.findMany.mockResolvedValue(mockShops);

        const { getShopsRepository } = require('../../repositories/shop');
        getShopsRepository.mockReturnValue(shopsRepository);

        const adminService = getAdminService(strapi);

        // Act
        const result = await adminService.settings.getSettings(false);

        // Assert
        expect(result).toEqual({
          shops: [
            {
              id: 1,
              vendor: 'test-vendor',
              apiKey: 'test123456',
              apiSecretKey: 'secret123456',
              adminApiAccessToken: 'token123456',
              isActive: true,
              webhooks: [],
            },
          ],
        });
      });
    });

    describe('restore', () => {
      it('should call shopsRepository.restore', async () => {
        // Arrange
        const strapi = getMockStrapi();
        const shopsRepository = getMockShopsRepository();

        const { getShopsRepository } = require('../../repositories/shop');
        getShopsRepository.mockReturnValue(shopsRepository);

        const adminService = getAdminService(strapi);

        // Act
        await adminService.settings.restore();

        // Assert
        expect(shopsRepository.restore).toHaveBeenCalled();
      });
    });
  });

  describe('shops', () => {
    describe('getShops', () => {
      it('should return shops with hidden sensitive data', async () => {
        // Arrange
        const strapi = getMockStrapi();
        const shopsRepository = getMockShopsRepository();
        const mockShops = [getMockShop()];
        shopsRepository.findMany.mockResolvedValue(mockShops);

        const { getShopsRepository } = require('../../repositories/shop');
        getShopsRepository.mockReturnValue(shopsRepository);

        const adminService = getAdminService(strapi);

        // Act
        const result = await adminService.shops.getShops({ isActive: true });

        // Assert
        expect(result).toEqual([
          {
            id: 1,
            vendor: 'test-vendor',
            apiKey: 'tes*****6',
            apiSecretKey: 'sec*****6',
            isActive: true,
            webhooks: [],
            adminApiAccessToken: 'tok*****6',
          },
        ]);
      });
    });

    describe('getShop', () => {
      it('should return shop with hidden sensitive data', async () => {
        // Arrange
        const strapi = getMockStrapi();
        const shopsRepository = getMockShopsRepository();
        const mockShop = getMockShop();
        shopsRepository.findOne.mockResolvedValue(mockShop);

        const { getShopsRepository } = require('../../repositories/shop');
        getShopsRepository.mockReturnValue(shopsRepository);

        const adminService = getAdminService(strapi);

        // Act
        const result = await adminService.shops.getShop({ id: 1 });

        // Assert
        expect(result).toEqual({
          id: 1,
          vendor: 'test-vendor',
          apiKey: 'tes*****6',
          apiSecretKey: 'sec*****6',
          adminApiAccessToken: 'tok*****6',
          isActive: true,
          webhooks: [],
        });
      });

      it('should return undefined when shop not found', async () => {
        // Arrange
        const strapi = getMockStrapi();
        const shopsRepository = getMockShopsRepository();
        shopsRepository.findOne.mockResolvedValue(null);

        const { getShopsRepository } = require('../../repositories/shop');
        getShopsRepository.mockReturnValue(shopsRepository);

        const adminService = getAdminService(strapi);

        // Act
        const result = await adminService.shops.getShop({ id: 1 });

        // Assert
        expect(result).toBeUndefined();
      });
    });

    describe('addShop', () => {
      it('should throw BadRequestException when shop already exists', async () => {
        // Arrange
        const strapi = getMockStrapi();
        const shopsRepository = getMockShopsRepository();
        const mockShop = getMockShop();
        shopsRepository.count.mockResolvedValue(1);

        const { getShopsRepository } = require('../../repositories/shop');
        getShopsRepository.mockReturnValue(shopsRepository);

        const adminService = getAdminService(strapi);

        // Act & Assert
        await expect(adminService.shops.addShop(mockShop)).rejects.toThrow(BadRequestException);
      });

      it('should create new shop and webhooks', async () => {
        // Arrange
        const strapi = getMockStrapi();
        const shopsRepository = getMockShopsRepository();
        const webhookRepository = getMockWebhookRepository();
        const webhookService = getMockWebhookService();

        const mockShop = getMockShop({
          webhooks: [
            { topic: WebhookSubscriptionTopic.ProductsCreate, service: 'test', method: 'test' },
          ],
        });

        shopsRepository.count.mockResolvedValue(0);
        shopsRepository.create.mockResolvedValue({ id: 1, ...mockShop });
        webhookRepository.create.mockResolvedValue({
          id: 1,
          documentId: 'test',
          shopifyId: 'test',
          topic: WebhookSubscriptionTopic.ProductsCreate,
          format: WebhookSubscriptionFormat.Json,
          callbackUrl: 'test',
          service: 'test',
          method: 'test',
        } as Webhook);
        webhookService.create.mockResolvedValue([{ id: 1, shopifyId: 'test' } as WebhookData]);
        shopsRepository.findOne.mockResolvedValue({
          id: 1,
          ...mockShop,
          webhooks: [
            { topic: WebhookSubscriptionTopic.ProductsCreate, service: 'test', method: 'test' },
          ],
        });

        const { getShopsRepository } = require('../../repositories/shop');
        const { getWebhookRepository } = require('../../repositories/webhook');
        const { getService } = require('../../utils/getService');

        getShopsRepository.mockReturnValue(shopsRepository);
        getWebhookRepository.mockReturnValue(webhookRepository);
        getService.mockImplementation((strapi, name) => {
          if (name === 'webhook') return webhookService;
          return {};
        });

        const adminService = getAdminService(strapi);

        // Act
        const result = await adminService.shops.addShop(mockShop);

        // Assert
        expect(result).toBeDefined();
        expect(shopsRepository.create).toHaveBeenCalled();
        expect(webhookRepository.create).toHaveBeenCalled();
        expect(webhookService.create).toHaveBeenCalled();
      });
    });

    describe('removeShop', () => {
      it('should remove shop and associated webhooks', async () => {
        // Arrange
        const strapi = getMockStrapi();
        const shopsRepository = getMockShopsRepository();
        const webhookRepository = getMockWebhookRepository();
        const webhookService = getMockWebhookService();
        const shopService = getMockShopService();

        const mockShop = getMockShop({
          webhooks: [
            {
              topic: WebhookSubscriptionTopic.ProductsCreate,
              service: 'test',
              method: 'test',
            },
          ],
        });

        shopsRepository.findOne.mockResolvedValue(mockShop);
        webhookService.remove.mockResolvedValue([{ id: 'test', hasError: false }]);
        shopsRepository.remove.mockResolvedValue({ id: 1 });
        webhookRepository.removeMany.mockResolvedValue({ id: 1 });

        const { getShopsRepository } = require('../../repositories/shop');
        const { getWebhookRepository } = require('../../repositories/webhook');
        const { getService } = require('../../utils/getService');

        getShopsRepository.mockReturnValue(shopsRepository);
        getWebhookRepository.mockReturnValue(webhookRepository);
        getService.mockImplementation((strapi, name) => {
          if (name === 'webhook') return webhookService;
          if (name === 'shop') return shopService;
          return {};
        });

        const adminService = getAdminService(strapi);

        // Act
        const result = await adminService.shops.removeShop(1);

        // Assert
        expect(result).toBeDefined();
        expect(webhookService.remove).toHaveBeenCalled();
        expect(shopsRepository.remove).toHaveBeenCalled();
        expect(webhookRepository.removeMany).toHaveBeenCalled();
        expect(shopService.remove).toHaveBeenCalled();
      });

      it('should throw BadRequestException when webhook removal fails', async () => {
        // Arrange
        const strapi = getMockStrapi();
        const shopsRepository = getMockShopsRepository();
        const webhookService = getMockWebhookService();

        const mockShop = getMockShop({
          webhooks: [
            {
              topic: WebhookSubscriptionTopic.ProductsCreate,
              service: 'test',
              method: 'test',
            },
          ],
        });

        shopsRepository.findOne.mockResolvedValue(mockShop);
        webhookService.remove.mockResolvedValue([
          { id: 'test', hasError: true, errors: ['test error'] },
        ]);

        const { getShopsRepository } = require('../../repositories/shop');
        const { getService } = require('../../utils/getService');

        getShopsRepository.mockReturnValue(shopsRepository);
        getService.mockImplementation((strapi, name) => {
          if (name === 'webhook') return webhookService;
          return {};
        });

        const adminService = getAdminService(strapi);

        // Act & Assert
        await expect(adminService.shops.removeShop(1)).rejects.toThrow(BadRequestException);
      });
    });

    describe('updateShop', () => {
      it('should update shop and manage webhooks correctly', async () => {
        // Arrange
        const strapi = getMockStrapi();
        const shopsRepository = getMockShopsRepository();
        const webhookRepository = getMockWebhookRepository();
        const webhookService = getMockWebhookService();

        const oldShop = getMockShop({
          webhooks: [
            {
              id: 1,
              shopifyId: 'old-webhook-1',
              topic: WebhookSubscriptionTopic.ProductsCreate,
              service: 'old-service',
              method: 'old-method',
              format: WebhookSubscriptionFormat.Json,
              callbackUrl: 'test',
            } as Webhook,
          ],
        });

        const newShop = {
          ...oldShop,
          vendor: 'updated-vendor',
          webhooks: [
            {
              topic: WebhookSubscriptionTopic.ProductsCreate,
              service: 'new-service',
              method: 'new-method',
            },
            {
              topic: WebhookSubscriptionTopic.ProductsUpdate,
              service: 'new-service',
              method: 'new-method',
            },
          ],
        } as ShopifyShopWithId;

        shopsRepository.findOne.mockResolvedValue(oldShop);
        webhookService.remove.mockResolvedValue([{ id: 'old-webhook-1', hasError: false }]);
        webhookRepository.create.mockResolvedValue({
          id: 2,
          documentId: 'test',
          shopifyId: 'new-webhook-1',
          topic: WebhookSubscriptionTopic.ProductsUpdate,
          format: WebhookSubscriptionFormat.Json,
          callbackUrl: 'test',
          service: 'new-service',
          method: 'new-method',
        } as Webhook);
        webhookService.create.mockResolvedValue([
          { id: 2, shopifyId: 'new-webhook-1' } as WebhookData,
        ]);
        shopsRepository.update.mockResolvedValue(newShop);

        const { getShopsRepository } = require('../../repositories/shop');
        const { getWebhookRepository } = require('../../repositories/webhook');
        const { getService } = require('../../utils/getService');

        getShopsRepository.mockReturnValue(shopsRepository);
        getWebhookRepository.mockReturnValue(webhookRepository);
        getService.mockImplementation((strapi, name) => {
          if (name === 'webhook') return webhookService;
          return {};
        });

        const adminService = getAdminService(strapi);

        // Act
        const result = await adminService.shops.updateShop(newShop);

        // Assert
        expect(result).toBeDefined();
        expect(shopsRepository.findOne).toHaveBeenCalledWith({
          where: { id: newShop.id },
          populate: { webhooks: true },
        });
        expect(webhookService.remove).toHaveBeenCalledWith(newShop.vendor, ['old-webhook-1']);
        expect(webhookRepository.create).toHaveBeenCalled();
        expect(webhookService.create).toHaveBeenCalled();
        expect(shopsRepository.update).toHaveBeenCalled();
      });

      it('should throw BadRequestException when shop not found', async () => {
        // Arrange
        const strapi = getMockStrapi();
        const shopsRepository = getMockShopsRepository();
        const mockShop = getMockShop();

        shopsRepository.findOne.mockResolvedValue(null);

        const { getShopsRepository } = require('../../repositories/shop');
        getShopsRepository.mockReturnValue(shopsRepository);

        const adminService = getAdminService(strapi);

        // Act & Assert
        await expect(adminService.shops.updateShop(mockShop)).rejects.toThrow(BadRequestException);
        expect(shopsRepository.findOne).toHaveBeenCalledWith({
          where: { id: mockShop.id },
          populate: { webhooks: true },
        });
      });

      it('should remove webhooks when they are removed from the shop', async () => {
        // Arrange
        const { shopsRepository, webhookRepository, webhookService, adminService } =
          setupUpdateShopTest();

        const oldShop = getMockShop({
          webhooks: [
            getMockWebhook(),
            getMockWebhook({
              id: 2,
              shopifyId: 'webhook-2',
              topic: WebhookSubscriptionTopic.ProductsUpdate,
            }),
          ],
        });

        const newShop = {
          ...oldShop,
          webhooks: [
            {
              topic: WebhookSubscriptionTopic.ProductsCreate,
              service: 'test-service',
              method: 'test-method',
            },
            {
              topic: WebhookSubscriptionTopic.ProductsDelete,
              service: 'test-service',
              method: 'test-method',
            },
          ],
        } as ShopifyShopWithId;

        shopsRepository.findOne.mockResolvedValue(oldShop);
        webhookService.remove.mockResolvedValue([{ id: 'webhook-2', hasError: false }]);
        webhookRepository.removeMany.mockResolvedValue({ count: 1 });
        webhookRepository.create.mockResolvedValue(
          getMockWebhook({
            id: 3,
            shopifyId: 'new-webhook-1',
            topic: WebhookSubscriptionTopic.ProductsDelete,
          })
        );
        webhookService.create.mockResolvedValue([
          getMockWebhookData({ id: 3, shopifyId: 'new-webhook-1' }),
        ]);
        shopsRepository.update.mockResolvedValue(newShop);

        // Act
        const result = await adminService.shops.updateShop(newShop);

        // Assert
        expect(result).toBeDefined();
        expect(webhookService.remove).toHaveBeenCalledWith(oldShop.vendor, ['webhook-2']);
        expect(webhookRepository.removeMany).toHaveBeenCalledWith({
          where: {
            id: {
              $in: [2],
            },
          },
        });
      });

      it('should add new webhooks when they are added to the shop', async () => {
        // Arrange
        const { shopsRepository, webhookRepository, webhookService, adminService } =
          setupUpdateShopTest();

        const oldShop = getMockShop({
          webhooks: [
            getMockWebhook(),
            getMockWebhook({
              id: 2,
              shopifyId: 'webhook-2',
              topic: WebhookSubscriptionTopic.ProductsDelete,
            }),
          ],
        });

        const newWebhook = {
          topic: WebhookSubscriptionTopic.ProductsUpdate,
          service: 'new-service',
          method: 'new-method',
        };

        const newShop = {
          ...oldShop,
          webhooks: [
            {
              topic: WebhookSubscriptionTopic.ProductsCreate,
              service: 'test-service',
              method: 'test-method',
            },
            newWebhook,
          ],
        } as ShopifyShopWithId;

        const createdWebhook = getMockWebhook({
          id: 3,
          shopifyId: 'new-webhook-1',
          topic: WebhookSubscriptionTopic.ProductsUpdate,
          service: 'new-service',
          method: 'new-method',
        });

        shopsRepository.findOne.mockResolvedValue(oldShop);
        webhookService.remove.mockResolvedValue([{ id: 'webhook-2', hasError: false }]);
        webhookRepository.removeMany.mockResolvedValue({ count: 1 });
        webhookRepository.create.mockResolvedValue(createdWebhook);
        webhookService.create.mockResolvedValue([
          getMockWebhookData({ id: 3, shopifyId: 'new-webhook-1' }),
        ]);
        shopsRepository.update.mockResolvedValue(newShop);

        // Act
        const result = await adminService.shops.updateShop(newShop);

        // Assert
        expect(result).toBeDefined();
        expect(webhookService.remove).toHaveBeenCalledWith(oldShop.vendor, ['webhook-2']);
        expect(webhookRepository.removeMany).toHaveBeenCalledWith({
          where: {
            id: {
              $in: [2],
            },
          },
        });
        expect(webhookRepository.create).toHaveBeenCalledWith(true, {
          topic: WebhookSubscriptionTopic.ProductsUpdate,
          format: WebhookSubscriptionFormat.Json,
          shop: expect.objectContaining({
            id: oldShop.id,
            vendor: oldShop.vendor,
            webhooks: [
              {
                topic: WebhookSubscriptionTopic.ProductsCreate,
                service: 'test-service',
                method: 'test-method',
              },
              {
                topic: WebhookSubscriptionTopic.ProductsUpdate,
                service: 'new-service',
                method: 'new-method',
              },
            ],
          }),
          service: 'new-service',
          method: 'new-method',
        });
        expect(webhookService.create).toHaveBeenCalledWith(oldShop.vendor, [createdWebhook]);
      });

      it('should update shop credentials when they are changed', async () => {
        // Arrange
        const { shopsRepository, adminService } = setupUpdateShopTest();

        const oldShop = getMockShop({
          apiKey: 'old-api-key',
          apiSecretKey: 'old-secret-key',
          adminApiAccessToken: 'old-token',
        });

        const newShop = {
          ...oldShop,
          apiKey: 'new-api-key',
          apiSecretKey: 'new-secret-key',
          adminApiAccessToken: 'new-token',
        } as ShopifyShopWithId;

        shopsRepository.findOne.mockResolvedValue(oldShop);
        shopsRepository.update.mockResolvedValue(newShop);

        // Act
        const result = await adminService.shops.updateShop(newShop);

        // Assert
        expect(result).toBeDefined();
        expect(shopsRepository.update).toHaveBeenCalledWith(
          { id: oldShop.id },
          expect.objectContaining({
            apiKey: 'new-api-key',
            apiSecretKey: 'new-secret-key',
            adminApiAccessToken: 'new-token',
          })
        );
      });

      it('should not update credentials when they contain masked values (*)', async () => {
        // Arrange
        const { shopsRepository, adminService } = setupUpdateShopTest();

        const oldShop = getMockShop({
          apiKey: 'old-api-key',
          apiSecretKey: 'old-secret-key',
          adminApiAccessToken: 'old-token',
        });

        const newShop = {
          ...oldShop,
          apiKey: 'tes*****6',
          apiSecretKey: 'sec*****6',
          adminApiAccessToken: 'tok*****6',
        } as ShopifyShopWithId;

        shopsRepository.findOne.mockResolvedValue(oldShop);
        shopsRepository.update.mockResolvedValue(newShop);

        // Act
        const result = await adminService.shops.updateShop(newShop);

        // Assert
        expect(result).toBeDefined();
        expect(shopsRepository.update).toHaveBeenCalledWith(
          { id: oldShop.id },
          expect.objectContaining({
            apiKey: 'old-api-key',
            apiSecretKey: 'old-secret-key',
            adminApiAccessToken: 'old-token',
          })
        );
      });

      it('should handle mixed updates with some masked and some new values', async () => {
        // Arrange
        const { shopsRepository, adminService } = setupUpdateShopTest();

        const oldShop = getMockShop({
          apiKey: 'old-api-key',
          apiSecretKey: 'old-secret-key',
          adminApiAccessToken: 'old-token',
          vendor: 'old-vendor',
        });

        const newShop = {
          ...oldShop,
          apiSecretKey: 'new-secret-key',
          vendor: 'new-vendor',
        } as ShopifyShopWithId;

        shopsRepository.findOne.mockResolvedValue(oldShop);
        shopsRepository.update.mockResolvedValue(newShop);

        // Act
        const result = await adminService.shops.updateShop(newShop);

        // Assert
        expect(result).toBeDefined();
        expect(shopsRepository.update).toHaveBeenCalledWith(
          { id: oldShop.id },
          expect.objectContaining({
            apiKey: 'old-api-key',
            apiSecretKey: 'new-secret-key',
            adminApiAccessToken: 'old-token',
            vendor: 'old-vendor',
          })
        );
      });
    });
  });

  describe('services', () => {
    describe('getServices', () => {
      it('should return filtered services with their methods', () => {
        // Arrange
        const strapi = getMockStrapi();
        strapi.services = {
          'test::service': {
            find: jest.fn(),
            create: jest.fn(),
          },
          'admin::service': {},
          'plugin::shopify::service': {},
        };

        const adminService = getAdminService(strapi);

        // Act
        const result = adminService.services.getServices();

        // Assert
        expect(result).toEqual([
          {
            name: 'test::service',
            methods: ['find', 'create'],
          },
        ]);
      });
    });
  });
});
