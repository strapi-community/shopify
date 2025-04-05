import { faker } from '@faker-js/faker/.';
import { CurrencyCode, type ProductFragmentFragment } from '../../../@types/shopify';
import { ShopService } from '../../../services/shopify.service';
import { applyProductValues } from '../applyProductValues';

describe('applyProductValues', () => {
  const getShopifyServiceMock = (): jest.Mocked<ShopService> => {
    return {
      getProductsById: jest.fn(),
      init: jest.fn(),
      searchProducts: jest.fn(),
    };
  };
  const getProductMock = (id?: string): ProductFragmentFragment => {
    return {
      id: id ?? faker.string.uuid(),
      title: faker.commerce.productName(),
      handle: faker.commerce.productAdjective(),
      description: faker.commerce.productDescription(),
      descriptionHtml: faker.commerce.productDescription(),
      createdAt: faker.date.past().toISOString(),
      updatedAt: faker.date.past().toISOString(),
      tags: [],
      translations: [],
      priceRangeV2: {
        maxVariantPrice: { amount: faker.commerce.price(), currencyCode: CurrencyCode.Usd },
        minVariantPrice: { amount: faker.commerce.price(), currencyCode: CurrencyCode.Usd },
      },
      variants: {
        nodes: [],
      },
      media: {
        nodes: [],
      },
    };
  };

  it('should apply product values to the result object', async () => {
    // Arrange
    const result = {};
    const firstProduct = faker.string.uuid();
    const secondProduct = faker.string.uuid();
    const productFields = new Map([
      [
        'vendor1',
        new Map([
          ['title', firstProduct],
          ['description', secondProduct],
        ]),
      ],
    ]);

    // Act
    const mockProduct1 = getProductMock();

    const mockProduct2 = getProductMock();

    const productsValues = new Map([
      [firstProduct, mockProduct1],
      [secondProduct, mockProduct2],
    ]);

    const mockShopifyService = getShopifyServiceMock();

    mockShopifyService.getProductsById.mockResolvedValue(productsValues);

    const finalResult = await applyProductValues(result, productFields, mockShopifyService);

    // Assert
    expect(mockShopifyService.getProductsById).toHaveBeenCalledWith('vendor1', [
      firstProduct,
      secondProduct,
    ]);

    expect(finalResult).toEqual({
      title: mockProduct1,
      description: mockProduct2,
    });
  });

  it('should handle multiple vendors', async () => {
    // Arrange
    const result = {};
    const firstProduct = faker.string.uuid();
    const secondProduct = faker.string.uuid();
    const productFields = new Map([
      ['vendor1', new Map([['product.title', firstProduct]])],
      ['vendor2', new Map([['product.description', secondProduct]])],
    ]);

    const mockProduct1 = getProductMock(firstProduct);

    const mockProduct2 = getProductMock(secondProduct);

    const productsValues1 = new Map([[firstProduct, mockProduct1]]);

    const productsValues2 = new Map([[secondProduct, mockProduct2]]);

    const mockShopifyService = getShopifyServiceMock();

    mockShopifyService.getProductsById
      .mockResolvedValueOnce(productsValues1)
      .mockResolvedValueOnce(productsValues2);

    // Act
    const finalResult = await applyProductValues(result, productFields, mockShopifyService);

    // Assert
    expect(mockShopifyService.getProductsById).toHaveBeenCalledTimes(2);
    expect(mockShopifyService.getProductsById).toHaveBeenCalledWith('vendor1', [firstProduct]);
    expect(mockShopifyService.getProductsById).toHaveBeenCalledWith('vendor2', [secondProduct]);
    expect(finalResult).toEqual({
      product: {
        title: mockProduct1,
        description: mockProduct2,
      },
    });
  });

  it('should not set values for products that do not exist', async () => {
    // Arrange
    const result = {};
    const productFields = new Map([
      [
        'vendor1',
        new Map([
          ['product.title', 'product1'],
          ['product.description', 'product2'],
        ]),
      ],
    ]);

    const mockProduct1 = getProductMock();
    const productsValues = new Map([['product1', mockProduct1]]);

    const mockShopifyService = getShopifyServiceMock();

    mockShopifyService.getProductsById.mockResolvedValue(productsValues);

    // Act
    const finalResult = await applyProductValues(result, productFields, mockShopifyService);

    // Assert
    expect(finalResult).toEqual({
      product: {
        title: mockProduct1,
      },
    });
  });

  it('should handle nested paths in the result object', async () => {
    // Arrange
    const result = {
      existing: {
        value: 'test',
      },
    };
    const productFields = new Map([['vendor1', new Map([['existing.product.title', 'product1']])]]);

    const mockProduct1 = getProductMock();

    const productsValues = new Map([['product1', mockProduct1]]);
    const mockShopifyService = getShopifyServiceMock();

    // Act
    mockShopifyService.getProductsById.mockResolvedValue(productsValues);

    const finalResult = await applyProductValues(result, productFields, mockShopifyService);

    // Assert
    expect(finalResult).toEqual({
      existing: {
        value: 'test',
        product: {
          title: mockProduct1,
        },
      },
    });
  });
});
