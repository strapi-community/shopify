import { Core } from '@strapi/strapi';
import register from '../src/register';
import { getService } from '../src/utils';
import { getModelsFieldsMap } from '../src/utils';

jest.mock('../src/utils', () => ({
  ...jest.requireActual('../src/utils'),
  getService: jest.fn(),
  getModelsFieldsMap: jest.fn(),
  getShopifyFields: jest.fn(),
  applyProductValues: jest.fn(),
}));

const getMockStrapi = (): Core.Strapi =>
  ({
    customFields: {
      register: jest.fn(),
    },
    contentTypes: {},
    components: {},
    documents: {
      use: jest.fn(),
    },
  }) as unknown as Core.Strapi;

const getMockShopifyService = () => ({
  getProduct: jest.fn(),
});

describe('register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('custom field registration', () => {
    it('should register the product custom field', () => {
      // Arrange
      const strapi = getMockStrapi();

      // Act
      register({ strapi });

      // Assert
      expect(strapi.customFields.register).toHaveBeenCalledWith({
        name: 'product',
        plugin: 'shopify',
        type: 'json',
      });
    });
  });

  describe('document middleware', () => {
    it('should set up document middleware', () => {
      // Arrange
      const strapi = getMockStrapi();

      // Act
      register({ strapi });

      // Assert
      expect(strapi.documents.use).toHaveBeenCalled();
    });

    it('should handle findOne action with product field', async () => {
      // Arrange
      const strapi = getMockStrapi();
      const mockShopifyService = getMockShopifyService();
      (getService as jest.Mock).mockReturnValue(mockShopifyService);

      const mockContentType = {
        attributes: {
          product: {
            type: 'customField',
            customField: 'plugin::shopify.product',
          },
        },
      };

      const mockResult = {
        id: 1,
        product: { id: 'gid://shopify/Product/123' },
      };

      (getModelsFieldsMap as jest.Mock).mockReturnValue(
        new Map([['api::test.test', mockContentType]])
      );

      const mockNext = jest.fn().mockResolvedValue(mockResult);
      const mockContext = {
        action: 'findOne',
        uid: 'api::test.test',
      };

      // Act
      register({ strapi });
      const middleware = (strapi.documents.use as jest.Mock).mock.calls[0][0];
      const result = await middleware(mockContext, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(getService).toHaveBeenCalledWith(strapi, 'shopify');
    });

    it('should handle findMany action with product field', async () => {
      // Arrange
      const strapi = getMockStrapi();
      const mockShopifyService = getMockShopifyService();
      (getService as jest.Mock).mockReturnValue(mockShopifyService);

      const mockContentType = {
        attributes: {
          product: {
            type: 'customField',
            customField: 'plugin::shopify.product',
          },
        },
      };

      const mockResult = [
        {
          id: 1,
          product: { id: 'gid://shopify/Product/123' },
        },
      ];

      (getModelsFieldsMap as jest.Mock).mockReturnValue(
        new Map([['api::test.test', mockContentType]])
      );

      const mockNext = jest.fn().mockResolvedValue(mockResult);
      const mockContext = {
        action: 'findMany',
        uid: 'api::test.test',
      };

      // Act
      register({ strapi });
      const middleware = (strapi.documents.use as jest.Mock).mock.calls[0][0];
      await middleware(mockContext, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(getService).toHaveBeenCalledWith(strapi, 'shopify');
    });

    it('should pass through for non-product content types', async () => {
      // Arrange
      const strapi = getMockStrapi();
      const mockShopifyService = getMockShopifyService();
      (getService as jest.Mock).mockReturnValue(mockShopifyService);
      (getModelsFieldsMap as jest.Mock).mockReturnValue(new Map());

      const mockResult = { id: 1 };
      const mockNext = jest.fn().mockResolvedValue(mockResult);
      const mockContext = {
        action: 'findOne',
        uid: 'api::test.test',
      };

      // Act
      register({ strapi });
      const middleware = (strapi.documents.use as jest.Mock).mock.calls[0][0];
      const result = await middleware(mockContext, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(result).toBe(mockResult);
    });

    it('should pass through for non-find actions', async () => {
      // Arrange
      const strapi = getMockStrapi();
      const mockShopifyService = getMockShopifyService();
      (getService as jest.Mock).mockReturnValue(mockShopifyService);

      const mockResult = { id: 1 };
      const mockNext = jest.fn().mockResolvedValue(mockResult);
      const mockContext = {
        action: 'create',
        uid: 'api::test.test',
      };

      // Act
      register({ strapi });
      const middleware = (strapi.documents.use as jest.Mock).mock.calls[0][0];
      const result = await middleware(mockContext, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(result).toBe(mockResult);
    });
  });
});
