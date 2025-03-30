import adminController from '../../controllers/admin.controller';
import { getService } from '../../utils/getService';
import { Core } from '@strapi/types';
import { faker } from '@faker-js/faker/.';
import { forgeFakeShop, forgeFakeShowWithWebhooks } from '../../../__tests__/forgers';

jest.mock('../../utils/getService');

describe('admin.controller', () => {
  const getMockAdminService = () => ({
    settings: {
      getSettings: jest.fn(),
      restore: jest.fn(),
    },
    services: {
      getServices: jest.fn(),
    },
    shops: {
      getShops: jest.fn(),
      getShop: jest.fn(),
      addShop: jest.fn(),
      removeShop: jest.fn(),
      updateShop: jest.fn(),
    },
  });

  const getController = (mockAdminService: any) => {
    const mockStrapi = {} as unknown as Core.Strapi;
    (getService as jest.Mock).mockReturnValue(mockAdminService);
    return adminController({ strapi: mockStrapi });
  };

  const getRequestContext = ({
    query = {},
    params = {},
    request = { body: {} },
    badRequest = jest.fn(),
  }: {
    query?: any;
    params?: any;
    request?: any;
    badRequest?: jest.Mock;
  } = {}) => ({
    query,
    params,
    request,
    badRequest,
  });

  describe('getSettings', () => {
    it('should return settings from admin service', async () => {
      // Arrange
      const mockAdminService = getMockAdminService();
      const controller = getController(mockAdminService);
      const mockSettings = { someSetting: 'value' };
      mockAdminService.settings.getSettings.mockResolvedValue(mockSettings);

      // Act
      const result = await controller.getSettings();

      // Assert
      expect(result).toEqual(mockSettings);
      expect(mockAdminService.settings.getSettings).toHaveBeenCalled();
    });
  });

  describe('restore', () => {
    it('should call restore from admin service', async () => {
      // Arrange
      const mockAdminService = getMockAdminService();
      const controller = getController(mockAdminService);
      const mockResult = { success: true };
      mockAdminService.settings.restore.mockResolvedValue(mockResult);

      // Act
      const result = await controller.restore();

      // Assert
      expect(result).toEqual(mockResult);
      expect(mockAdminService.settings.restore).toHaveBeenCalled();
    });
  });

  describe('getServices', () => {
    it('should return services from admin service', async () => {
      // Arrange
      const mockAdminService = getMockAdminService();
      const controller = getController(mockAdminService);
      const mockServices = [{ id: 1, name: 'Service 1' }];
      mockAdminService.services.getServices.mockResolvedValue(mockServices);

      // Act
      const result = await controller.getServices({} as any);

      // Assert
      expect(result).toEqual(mockServices);
      expect(mockAdminService.services.getServices).toHaveBeenCalled();
    });
  });

  describe('getShops', () => {
    it('should return shops when query is valid', async () => {
      // Arrange
      const mockAdminService = getMockAdminService();
      const controller = getController(mockAdminService);
      const mockShops = [forgeFakeShop()];
      const mockQuery = { page: 1, pageSize: 10 };
      mockAdminService.shops.getShops.mockResolvedValue(mockShops);

      // Act
      const result = await controller.getShops(getRequestContext({ query: mockQuery }) as any);

      // Assert
      expect(result).toEqual(mockShops);
      expect(mockAdminService.shops.getShops).toHaveBeenCalledWith(mockQuery);
    });

    it('should return bad request when query is invalid', async () => {
      const mockAdminService = getMockAdminService();
      const controller = getController(mockAdminService);

      const ctx = getRequestContext({ query: { page: -1 } });
      await controller.getShops(ctx as any);

      expect(ctx.badRequest).toHaveBeenCalled();
      expect(mockAdminService.shops.getShops).not.toHaveBeenCalled();
    });
  });

  describe('getShop', () => {
    it('should return shop when params are valid', async () => {
      const mockAdminService = getMockAdminService();
      const controller = getController(mockAdminService);
      const mockShop = forgeFakeShop();
      mockAdminService.shops.getShop.mockResolvedValue(mockShop);

      const result = await controller.getShop(
        getRequestContext({ params: { shopId: '1' } }) as any
      );

      expect(result).toEqual(mockShop);
      expect(mockAdminService.shops.getShop).toHaveBeenCalled();
    });

    it('should return bad request when params are empty', async () => {
      const mockAdminService = getMockAdminService();
      const controller = getController(mockAdminService);
      const mockCtx = {
        params: { shopId: '' },
        query: {},
        badRequest: jest.fn(),
      };

      await controller.getShop(mockCtx as any);

      expect(mockCtx.badRequest).toHaveBeenCalled();
      expect(mockAdminService.shops.getShop).not.toHaveBeenCalled();
    });
    it('should return bad request when params are invalid', async () => {
      const mockAdminService = getMockAdminService();
      const controller = getController(mockAdminService);
      const mockCtx = {
        params: { shopId: faker.string.uuid() },
        query: {},
        badRequest: jest.fn(),
      };

      await controller.getShop(mockCtx as any);

      expect(mockCtx.badRequest).toHaveBeenCalled();
      expect(mockAdminService.shops.getShop).not.toHaveBeenCalled();
    });
  });

  describe('addShop', () => {
    it('should add shop when payload is valid', async () => {
      const mockAdminService = getMockAdminService();
      const controller = getController(mockAdminService);
      const mockShop = forgeFakeShop();
      const mockPayload = forgeFakeShowWithWebhooks();
      mockAdminService.shops.addShop.mockResolvedValue(mockShop);

      const result = await controller.addShop(
        getRequestContext({
          params: { shopId: '1' },
          request: { body: mockPayload },
        }) as any
      );

      expect(result).toEqual(mockShop);
      expect(mockAdminService.shops.addShop).toHaveBeenCalled();
    });

    it('should return bad request when payload is invalid', async () => {
      const mockAdminService = getMockAdminService();
      const controller = getController(mockAdminService);
      const ctx = getRequestContext({
        params: { shopId: '1' },
        request: { body: forgeFakeShop() },
      });

      await controller.addShop(ctx as any);

      expect(ctx.badRequest).toHaveBeenCalled();
      expect(mockAdminService.shops.addShop).not.toHaveBeenCalled();
    });
  });

  describe('removeShop', () => {
    it('should remove shop when params are valid', async () => {
      const mockAdminService = getMockAdminService();
      const controller = getController(mockAdminService);
      const mockResult = { success: true };
      mockAdminService.shops.removeShop.mockResolvedValue(mockResult);

      const result = await controller.removeShop(
        getRequestContext({ params: { shopId: '1' } }) as any
      );

      expect(result).toEqual(mockResult);
      expect(mockAdminService.shops.removeShop).toHaveBeenCalledWith(1);
    });

    it('should return bad request when params are empty', async () => {
      const mockAdminService = getMockAdminService();
      const controller = getController(mockAdminService);
      const ctx = getRequestContext({ params: { shopId: '' } });

      await controller.removeShop(ctx as any);

      expect(ctx.badRequest).toHaveBeenCalled();
      expect(mockAdminService.shops.removeShop).not.toHaveBeenCalled();
    });
    it('should return bad request when params are invalid', async () => {
      const mockAdminService = getMockAdminService();
      const controller = getController(mockAdminService);
      const ctx = getRequestContext({ params: { shopId: faker.string.uuid() } });

      await controller.removeShop(ctx as any);

      expect(ctx.badRequest).toHaveBeenCalled();
      expect(mockAdminService.shops.removeShop).not.toHaveBeenCalled();
    });
  });

  describe('updateShop', () => {
    it('should update shop when payload is valid', async () => {
      const mockAdminService = getMockAdminService();
      const controller = getController(mockAdminService);
      const mockShop = forgeFakeShop();
      const mockPayload = forgeFakeShowWithWebhooks();
      mockAdminService.shops.updateShop.mockResolvedValue(mockShop);

      const result = await controller.updateShop(
        getRequestContext({
          params: { shopId: '1' },
          request: { body: mockPayload },
        }) as any
      );

      expect(result).toEqual(mockShop);
      expect(mockAdminService.shops.updateShop).toHaveBeenCalled();
    });

    it('should return bad request when payload is invalid', async () => {
      const mockAdminService = getMockAdminService();
      const controller = getController(mockAdminService);
      const ctx = getRequestContext({
        params: { shopId: '1' },
        request: { body: {} },
      });

      await controller.updateShop(ctx as any);

      expect(ctx.badRequest).toHaveBeenCalled();
      expect(mockAdminService.shops.updateShop).not.toHaveBeenCalled();
    });
  });
});
