import { faker } from '@faker-js/faker';
import { COMPONENT_FIELDS } from '../../../const';
import { getShopifyFields } from '../getShopifyFields';
import { forgeFakeShop } from '../../../../__tests__/forgers';
import type { FieldType } from '../../../@types/document.service';

describe('getShopifyFields', () => {
  const mockContentTypes = new Map();
  const mockComponents = new Map();

  beforeEach(() => {
    jest.clearAllMocks();
    mockContentTypes.clear();
    mockComponents.clear();
  });

  it('should return empty map when fetchedData is null', () => {
    const result = getShopifyFields({
      contentType: [],
      fetchedData: null,
      contentTypes: mockContentTypes,
      components: mockComponents,
    });

    expect(result).toEqual(new Map());
  });

  it('should return empty map when fetchedData is number', () => {
    const result = getShopifyFields({
      contentType: [],
      fetchedData: faker.number.int(),
      contentTypes: mockContentTypes,
      components: mockComponents,
    });

    expect(result).toEqual(new Map());
  });


  it('should process raw field with shopify product data', () => {
    const mockShop = forgeFakeShop();
    const contentType: FieldType[] = [
      {
        field: 'product',
        type: COMPONENT_FIELDS.RAW,
      },
    ];

    const fetchedData: any = {
      product: {
        vendor: mockShop.vendor,
        product: 'test-product',
      },
    };

    const result = getShopifyFields({
      contentType,
      fetchedData,
      contentTypes: mockContentTypes,
      components: mockComponents,
    });

    expect(result.get(mockShop.vendor)).toBeDefined();
    expect(result.get(mockShop.vendor).get('product')).toBe('test-product');
  });

  it('should process component field with shopify product data', () => {
    const mockShop = forgeFakeShop();

    const componentFields: FieldType[] = [
      {
        field: 'product',
        type: COMPONENT_FIELDS.RAW,
      },
    ];

    const contentType: FieldType[] = [
      {
        field: 'testComponent',
        type: COMPONENT_FIELDS.COMPONENT,
        component: 'unit.test' as any,
        repeatable: false,
      },
    ];

    mockComponents.set('unit.test', componentFields);

    const fetchedData: any = {
      testComponent: {
        product: {
          vendor: mockShop.vendor,
          product: 'test-product',
        },
      },
    };

    const result = getShopifyFields({
      contentType,
      fetchedData,
      contentTypes: mockContentTypes,
      components: mockComponents,
    });

    expect(result.get(mockShop.vendor)).toBeDefined();
    expect(result.get(mockShop.vendor).get('testComponent.product')).toBe('test-product');
  });

  it('should process repeatable component field', () => {
    const mockShop = forgeFakeShop();

    const componentFields: FieldType[] = [
      {
        field: 'product',
        type: COMPONENT_FIELDS.RAW,
      },
    ];

    const contentType: FieldType[] = [
      {
        field: 'testComponents',
        type: COMPONENT_FIELDS.COMPONENT,
        component: 'unit.test' as any,
        repeatable: true,
      },
    ];

    mockComponents.set('unit.test', componentFields);

    const fetchedData: any = {
      testComponents: [
        {
          product: {
            vendor: mockShop.vendor,
            product: 'test-product-1',
          },
        },
        {
          product: {
            vendor: mockShop.vendor,
            product: 'test-product-2',
          },
        },
      ],
    };

    const result = getShopifyFields({
      contentType,
      fetchedData,
      contentTypes: mockContentTypes,
      components: mockComponents,
    });

    expect(result.get(mockShop.vendor)).toBeDefined();
    expect(result.get(mockShop.vendor).get('testComponents.0.product')).toBe('test-product-1');
    expect(result.get(mockShop.vendor).get('testComponents.1.product')).toBe('test-product-2');
  });

  it('should process dynamic zone field', () => {
    const mockShop = forgeFakeShop();

    const componentFields: FieldType[] = [
      {
        field: 'product',
        type: COMPONENT_FIELDS.RAW,
      },
    ];

    const contentType: FieldType[] = [
      {
        field: 'dynamicZone',
        type: COMPONENT_FIELDS.DYNAMICZONE,
        components: ['unit.test'],
      },
    ];

    mockComponents.set('unit.test', componentFields);

    const fetchedData: any = {
      dynamicZone: [
        {
          __component: 'unit.test',
          product: {
            vendor: mockShop.vendor,
            product: 'test-product',
          },
        },
      ],
    };

    const result = getShopifyFields({
      contentType,
      fetchedData,
      contentTypes: mockContentTypes,
      components: mockComponents,
    });

    expect(result.get(mockShop.vendor)).toBeDefined();
    expect(result.get(mockShop.vendor).get('dynamicZone.0.product')).toBe('test-product');
  });

  it('should process array of results', () => {
    const mockShop = forgeFakeShop();

    const contentType: FieldType[] = [
      {
        field: 'product',
        type: COMPONENT_FIELDS.RAW,
      },
    ];

    const fetchedData: any = [
      {
        product: {
          vendor: mockShop.vendor,
          product: 'test-product-1',
        },
      },
      {
        product: {
          vendor: mockShop.vendor,
          product: 'test-product-2',
        },
      },
    ];

    const result = getShopifyFields({
      contentType,
      fetchedData,
      contentTypes: mockContentTypes,
      components: mockComponents,
    });

    expect(result.get(mockShop.vendor)).toBeDefined();
    expect(result.get(mockShop.vendor).get('0.product')).toBe('test-product-1');
    expect(result.get(mockShop.vendor).get('1.product')).toBe('test-product-2');
  });

  it('should handle nested components', () => {
    const mockShop = forgeFakeShop();

    const nestedComponentFields: FieldType[] = [
      {
        field: 'product',
        type: COMPONENT_FIELDS.RAW,
      },
    ];

    const parentComponentFields: FieldType[] = [
      {
        field: 'nested',
        type: COMPONENT_FIELDS.COMPONENT,
        component: 'unit.test' as any,
        repeatable: false,
      },
    ];

    const contentType: FieldType[] = [
      {
        field: 'parent',
        type: COMPONENT_FIELDS.COMPONENT,
        component: 'unit.nested' as any,
        repeatable: false,
      },
    ];

    mockComponents.set('unit.test', nestedComponentFields);
    mockComponents.set('unit.nested', parentComponentFields);

    const fetchedData: any = {
      parent: {
        nested: {
          product: {
            vendor: mockShop.vendor,
            product: 'test-product',
          },
        },
      },
    };

    const result = getShopifyFields({
      contentType,
      fetchedData,
      contentTypes: mockContentTypes,
      components: mockComponents,
    });

    expect(result.get(mockShop.vendor)).toBeDefined();
    expect(result.get(mockShop.vendor).get('parent.nested.product')).toBe('test-product');
  });
});
