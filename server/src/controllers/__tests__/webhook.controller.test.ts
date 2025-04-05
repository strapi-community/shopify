import {
  forgeFakeShop,
  forgeFakeShowWithWebhooks,
  forgeFakeWebhook,
} from '../../../__tests__/forgers/shop';
import * as shopRepository from '../../repositories/shop';
import { StrapiContext } from 'src/@types';
import * as validators from '../../validators/webhook.validator';
import getWebhookController from '../webhook.controller';
import { Context } from 'koa';
import { left, right } from 'fp-ts/lib/Either';

jest.mock('../../repositories/shop', () => ({
  ...jest.requireActual('../../repositories/shop'),
  __esModule: true,
}));

jest.mock('../../validators/webhook.validator', () => ({
  ...jest.requireActual('../../validators/webhook.validator'),
  __esModule: true,
}));

describe('Webhook Controller', () => {
  const getMockStrapi = () => {
    return {
      log: {
        error: jest.fn(),
      },
      service: jest.fn(),
    } as unknown as StrapiContext['strapi'];
  };

  const mockContext = {
    request: {
      body: {},
    },
  } as unknown as Context;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handleWebhook', () => {
    it('should display error when no vendor is provided', async () => {
      // Arrange
      const mockStrapi = getMockStrapi();
      const controller = getWebhookController({ strapi: mockStrapi });

      // Act
      const result = await controller.handleWebhook(mockContext);

      // Assert
      expect(result).toEqual({});
      expect(mockStrapi.log.error).toHaveBeenCalledWith(
        'No vendor found in the webhook request body'
      );
    });

    it('should display error when validation fails', async () => {
      // Arrange
      const mockStrapi = getMockStrapi();
      const mockShop = forgeFakeShowWithWebhooks();
      jest.spyOn(shopRepository, 'getShopsRepository').mockReturnValue({
        findOne: jest.fn().mockResolvedValue(mockShop),
      } as any);

      jest
        .spyOn(validators, 'getUpdateProductValidator')
        .mockResolvedValue(left('Validation failed'));

      // Act
      const controller = getWebhookController({ strapi: mockStrapi });
      mockContext.request.body = { vendor: 'test-vendor' };
      const result = await controller.handleWebhook(mockContext);

      // Assert
      expect(result).toEqual({});
      expect(mockStrapi.log.error).toHaveBeenCalledWith('Validation failed', 'Validation failed');
    });

    it('should process webhook successfully when validation passes', async () => {
      // Arrange
      const mockStrapi = getMockStrapi();
      const mockShop = forgeFakeShowWithWebhooks();
      const methodName = 'updateProduct';
      const mockWebhook = forgeFakeWebhook({
        service: 'test-service',
        method: methodName,
      });
      const mockService = {
        [methodName]: jest.fn(),
      };

      jest.spyOn(shopRepository, 'getShopsRepository').mockReturnValue({
        findOne: jest.fn().mockResolvedValue(mockShop),
      } as any);

      jest.spyOn(validators, 'getUpdateProductValidator').mockResolvedValue(
        right({
          result: mockShop,
          webhook: mockWebhook,
        } as any)
      );

      mockStrapi.service = jest.fn().mockReturnValue(mockService);

      // Act
      const controller = getWebhookController({ strapi: mockStrapi });
      mockContext.request.body = { vendor: 'test-vendor' };
      const result = await controller.handleWebhook(mockContext);

      // Assert
      expect(result).toEqual({});
      expect(mockStrapi.service).toHaveBeenCalledWith(mockWebhook.service);
      expect(mockService[mockWebhook.method]).toHaveBeenCalledWith(
        mockContext.request.body,
        mockShop
      );
    });

    it('should not throw error when service method is not found provided in the webhook', async () => {
      // Arrange
      const mockStrapi = getMockStrapi();
      const mockShop = forgeFakeShowWithWebhooks();
      const mockWebhook = forgeFakeWebhook();
      const mockService = {};

      jest.spyOn(shopRepository, 'getShopsRepository').mockReturnValue({
        findOne: jest.fn().mockResolvedValue(mockShop),
      } as any);

      jest.spyOn(validators, 'getUpdateProductValidator').mockResolvedValue(
        right({
          result: mockShop,
          webhook: mockWebhook,
        } as any)
      );

      mockStrapi.service = jest.fn().mockReturnValue(mockService);

      // Act
      const controller = getWebhookController({ strapi: mockStrapi });
      mockContext.request.body = { vendor: 'test-vendor' };
      const result = await controller.handleWebhook(mockContext);

      // Assert
      expect(result).toEqual({});
      expect(mockStrapi.service).toHaveBeenCalledWith(mockWebhook.service);
      expect(mockService[mockWebhook.method]).toBeUndefined();
    });
  });
});
