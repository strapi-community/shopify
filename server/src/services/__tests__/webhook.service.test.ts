import { Core } from '@strapi/strapi';
import { WebhookSubscriptionTopic, WebhookSubscriptionFormat } from '../../@types/shopify';
import { WebhookData, WebhookWithShopId } from '../../repositories/validators';
import webhookService from '../webhook.service';
import { getService } from '../../utils/getService';
import { getHost } from '../../utils/getHost';
import { createSingleSubscriptionMutation } from '../shopify.gql';
import { getCorrectSuffix } from '../../utils/getCorrectSuffix';

jest.mock('../../utils/getService', () => ({
  ...jest.requireActual('../../utils/getService'),
  getService: jest.fn(),
}));

jest.mock('../../utils/getHost', () => ({
  getHost: jest.fn(),
}));

const getMockStrapi = (): Core.Strapi =>
  ({
    service: jest.fn(),
    services: {},
  }) as unknown as Core.Strapi;

const getMockShopService = () => ({
  getGQLClient: jest.fn().mockResolvedValue({
    request: jest.fn(),
  }),
});

const getMockWebhookService = (strapi: Core.Strapi) => {
  return webhookService({ strapi });
};

const getMockWebhook = (overrides: Partial<WebhookWithShopId> = {}): WebhookWithShopId => ({
  id: 1,
  topic: WebhookSubscriptionTopic.ProductsCreate,
  service: 'plugin::shopify.webhook',
  method: 'createProduct',
  ...overrides,
});

const getMockWebhookData = (overrides: Partial<WebhookData> = {}): WebhookData => ({
  id: 1,
  topic: WebhookSubscriptionTopic.ProductsCreate,
  shopifyId: 'gid://shopify/WebhookSubscription/123456789',
  format: WebhookSubscriptionFormat.Json,
  callbackUrl: `https://example.com${getCorrectSuffix(WebhookSubscriptionTopic.ProductsCreate)}`,
  errors: [],
  ...overrides,
});

describe('webhook.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getHost as jest.Mock).mockReturnValue('https://example.com');
  });

  describe('create', () => {
    it('should create webhooks for given vendor and hooks', async () => {
      // Arrange
      const mockStrapi = getMockStrapi();
      const shopService = getMockShopService();
      const mockWebhook = getMockWebhook();
      const mockWebhookData = getMockWebhookData();
      const mockRequest = jest.fn().mockResolvedValue({
        data: {
          webhookSubscriptionCreate: {
            webhookSubscription: {
              id: mockWebhookData.shopifyId,
              topic: mockWebhookData.topic,
              format: mockWebhookData.format,
              endpoint: {
                __typename: 'WebhookHttpEndpoint',
                callbackUrl: mockWebhookData.callbackUrl,
              },
            },
            userErrors: [],
          },
        },
      });

      (getService as jest.Mock).mockImplementation((strapi, name) => {
        if (name === 'shop') return shopService;
        return {};
      });

      shopService.getGQLClient.mockResolvedValue({
        request: mockRequest,
      });

      const service = getMockWebhookService(mockStrapi);

      // Act
      const result = await service.create('test-vendor', [mockWebhook]);

      // Assert
      expect(result).toEqual([mockWebhookData]);
      expect(shopService.getGQLClient).toHaveBeenCalledWith('test-vendor');
      expect(mockRequest).toHaveBeenCalledWith(
        createSingleSubscriptionMutation,
        expect.objectContaining({
          variables: {
            topic: mockWebhook.topic,
            webhookSubscription: {
              callbackUrl: `https://example.com${getCorrectSuffix(mockWebhook.topic)}`,
              format: WebhookSubscriptionFormat.Json,
            },
          },
        })
      );
    });

    it('should handle errors from Shopify API', async () => {
      // Arrange
      const mockStrapi = getMockStrapi();
      const shopService = getMockShopService();
      const mockWebhook = getMockWebhook();
      const mockError = 'Invalid webhook configuration';

      (getService as jest.Mock).mockImplementation((strapi, name) => {
        if (name === 'shop') return shopService;
        return {};
      });

      shopService.getGQLClient.mockResolvedValue({
        request: jest.fn().mockResolvedValue({
          data: {
            webhookSubscriptionCreate: {
              webhookSubscription: null,
              userErrors: [{ message: mockError }],
            },
          },
        }),
      });

      const service = getMockWebhookService(mockStrapi);

      // Act
      const result = await service.create('test-vendor', [mockWebhook]);

      // Assert
      expect(result).toEqual([
        {
          id: mockWebhook.id,
          shopifyId: undefined,
          callbackUrl: '',
          errors: [mockError],
        },
      ]);
    });
  });

  describe('validate', () => {
    it('should validate webhooks for given vendor', async () => {
      // Arrange
      const mockStrapi = getMockStrapi();
      const shopService = getMockShopService();
      const mockWebhookData = getMockWebhookData();

      (getService as jest.Mock).mockImplementation((strapi, name) => {
        if (name === 'shop') return shopService;
        return {};
      });

      shopService.getGQLClient.mockResolvedValue({
        request: jest.fn().mockResolvedValue({
          data: {
            webhookSubscriptions: {
              nodes: [
                {
                  id: mockWebhookData.shopifyId,
                  topic: mockWebhookData.topic,
                },
              ],
            },
          },
        }),
      });

      const service = getMockWebhookService(mockStrapi);

      // Act
      const result = await service.validate('test-vendor', [mockWebhookData]);

      // Assert
      expect(result).toEqual({
        [mockWebhookData.callbackUrl]: true,
      });
    });

    it('should return false when webhooks are not found', async () => {
      // Arrange
      const mockStrapi = getMockStrapi();
      const shopService = getMockShopService();
      const mockWebhookData = getMockWebhookData();

      (getService as jest.Mock).mockImplementation((strapi, name) => {
        if (name === 'shop') return shopService;
        return {};
      });

      shopService.getGQLClient.mockResolvedValue({
        request: jest.fn().mockResolvedValue({
          data: {
            webhookSubscriptions: {
              nodes: [],
            },
          },
        }),
      });
      jest.spyOn(console, 'error').mockImplementation();

      const service = getMockWebhookService(mockStrapi);

      // Act
      const result = await service.validate('test-vendor', [mockWebhookData]);

      // Assert
      expect(result).toEqual({
        [mockWebhookData.callbackUrl]: false,
      });
      expect(console.error).toHaveBeenCalledWith(
        `Webhook validation failed for ${mockWebhookData.callbackUrl}. Expected 1 got 0`
      );
    });
  });

  describe('remove', () => {
    it('should remove webhooks for given vendor', async () => {
      // Arrange
      const mockStrapi = getMockStrapi();
      const shopService = getMockShopService();
      const mockWebhookId = 'gid://shopify/WebhookSubscription/123456789';

      (getService as jest.Mock).mockImplementation((strapi, name) => {
        if (name === 'shop') return shopService;
        return {};
      });

      shopService.getGQLClient.mockResolvedValue({
        request: jest.fn().mockResolvedValue({
          data: {
            webhookSubscriptionDelete: {
              deletedWebhookSubscriptionId: mockWebhookId,
              userErrors: [],
            },
          },
        }),
      });

      const service = getMockWebhookService(mockStrapi);

      // Act
      const result = await service.remove('test-vendor', [mockWebhookId]);

      // Assert
      expect(result).toEqual([
        {
          id: mockWebhookId,
          hasError: false,
          errors: [],
        },
      ]);
    });

    it('should handle errors when removing webhooks', async () => {
      // Arrange
      const mockStrapi = getMockStrapi();
      const shopService = getMockShopService();
      const mockWebhookId = 'gid://shopify/WebhookSubscription/123456789';
      const mockError = 'Webhook not found';

      (getService as jest.Mock).mockImplementation((strapi, name) => {
        if (name === 'shop') return shopService;
        return {};
      });

      shopService.getGQLClient.mockResolvedValue({
        request: jest.fn().mockResolvedValue({
          data: {
            webhookSubscriptionDelete: {
              deletedWebhookSubscriptionId: null,
              userErrors: [{ message: mockError }],
            },
          },
        }),
      });

      const service = getMockWebhookService(mockStrapi);

      // Act
      const result = await service.remove('test-vendor', [mockWebhookId]);

      // Assert
      expect(result).toEqual([
        {
          id: mockWebhookId,
          hasError: true,
          errors: [mockError],
        },
      ]);
    });
  });
});
