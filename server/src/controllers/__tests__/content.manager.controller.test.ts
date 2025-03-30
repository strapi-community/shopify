import { StrapiContext } from '../../@types';
import type { RequestContext } from '../../@types/koa';
import contentManagerController from '../content.manager.controller';
import { getShopsRepository } from '../../repositories/shop';
import * as utils from '../../utils';
import * as shopRepository from '../../repositories/shop';
import { forgeFakeShop } from '../../../__tests__/forgers';

// Mock dependencies
jest.mock('../../repositories/shop', () => ({
  ...jest.requireActual('../../repositories/shop'),
  __esModule: true,
}));
jest.mock('../../utils', () => ({
  ...jest.requireActual('../../utils'),
  __esModule: true,
}));

const getMockStrapi = (findManyMock?: jest.Mock) =>
  ({
    query: jest.fn().mockReturnValue({
      findMany: findManyMock ?? jest.fn().mockResolvedValue([]),
    }),
  }) as unknown as StrapiContext['strapi'];

const getMockCtx = ({
  body,
  query,
  badRequest,
}: { body?: any; query?: any; badRequest?: jest.Mock } = {}) => {
  return {
    body: body ?? undefined,
    query: query ?? {},
    badRequest: badRequest ?? jest.fn(),
  } as unknown as RequestContext;
};

describe('content.manager.controller', () => {
  beforeEach(jest.restoreAllMocks);

  describe('getVendors', () => {
    it('should return list of vendors from shops', async () => {
      // Arrange
      const mockShops = [{ vendor: 'shop1' }, { vendor: 'shop2' }];
      const findManyMock = jest.fn().mockResolvedValue(mockShops);
      jest.spyOn(shopRepository, 'getShopsRepository').mockReturnValue({
        findMany: findManyMock,
      } as unknown as ReturnType<typeof getShopsRepository>);

      // Act
      const mockStrapi = getMockStrapi();
      const mockCtx = getMockCtx();
      const controller = contentManagerController({ strapi: mockStrapi });

      await controller.getVendors(mockCtx as RequestContext);

      // Assert
      expect(mockCtx.body).toEqual({ vendors: ['shop1', 'shop2'] });
      expect(mockCtx.badRequest).not.toHaveBeenCalled();
      expect(shopRepository.getShopsRepository).toHaveBeenCalledWith(mockStrapi);
      expect(findManyMock).toHaveBeenCalledWith({
        populate: {
          webhooks: false,
        },
      });
    });
  });

  describe('getProducts', () => {
    // const mockShops = [{ vendor: 'shop1' }, { vendor: 'shop2' }];

    it('should return products when valid query is provided', async () => {
      // Arrange
      const mockProducts = [{ id: 1, title: 'Product 1' }];

      jest.spyOn(utils, 'getService').mockReturnValue({
        searchProducts: jest.fn().mockResolvedValue(mockProducts),
      } as unknown as ReturnType<typeof utils.getService>);

      const mockShops = [forgeFakeShop({ vendor: 'shop1' })];
      jest.spyOn(shopRepository, 'getShopsRepository').mockReturnValue({
        findMany: jest.fn().mockResolvedValue(mockShops),
      } as unknown as ReturnType<typeof shopRepository.getShopsRepository>);

      const mockCtx = getMockCtx({
        query: {
          vendor: 'shop1',
          q: 'test',
        },
      });

      // Act
      const mockStrapi = getMockStrapi(jest.fn().mockResolvedValue(mockProducts));
      const controller = contentManagerController({ strapi: mockStrapi });
      await controller.getProducts(mockCtx as RequestContext);

      // Assert
      expect(mockCtx.body).toEqual(mockProducts);
    });

    it('should return bad request when query is too short', async () => {
      // Arrange
      const mockShops = [forgeFakeShop({ vendor: 'shop1' })];
      jest.spyOn(shopRepository, 'getShopsRepository').mockReturnValue({
        findMany: jest.fn().mockResolvedValue(mockShops),
      } as unknown as ReturnType<typeof shopRepository.getShopsRepository>);

      const mockCtx = getMockCtx({
        query: {
          vendor: 'shop1',
          q: 't',
        },
      });

      // Act
      const mockStrapi = getMockStrapi();
      const controller = contentManagerController({ strapi: mockStrapi });
      await controller.getProducts(mockCtx as RequestContext);

      // Assert
      expect(mockCtx.badRequest).toHaveBeenCalled();
    });

    it('should return bad request when vendor is invalid', async () => {
      // Arrange
      const mockShops = [forgeFakeShop({ vendor: 'shop1' })];
      jest.spyOn(shopRepository, 'getShopsRepository').mockReturnValue({
        findMany: jest.fn().mockResolvedValue(mockShops),
      } as unknown as ReturnType<typeof shopRepository.getShopsRepository>);

      const mockCtx = getMockCtx({
        query: {
          vendor: 'invalid-shop',
          q: 'test',
        },
      });

      // Act
      const mockStrapi = getMockStrapi();
      const controller = contentManagerController({ strapi: mockStrapi });
      await controller.getProducts(mockCtx as RequestContext);

      // Assert
      expect(mockCtx.badRequest).toHaveBeenCalled();
    });

    it('should handle single vendor case correctly', async () => {
      // Arrange
      const mockProducts = [{ id: 1, title: 'Product 1' }];
      jest.spyOn(utils, 'getService').mockReturnValue({
        searchProducts: jest.fn().mockResolvedValue(mockProducts),
      } as unknown as ReturnType<typeof utils.getService>);

      const mockShops = [forgeFakeShop({ vendor: 'shop1' })];
      jest.spyOn(shopRepository, 'getShopsRepository').mockReturnValue({
        findMany: jest.fn().mockResolvedValue(mockShops),
      } as unknown as ReturnType<typeof shopRepository.getShopsRepository>);

      const mockCtx = getMockCtx({
        query: {
          q: 'test',
        },
      });

      // Act
      const mockStrapi = getMockStrapi();
      const controller = contentManagerController({ strapi: mockStrapi });
      await controller.getProducts(mockCtx);

      // Assert
      expect(mockCtx.body).toEqual(mockProducts);
    });
  });
});
