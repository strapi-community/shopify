import type { Schema } from '@strapi/strapi';
import {
  forgeFakeContentTypeWithoutShopifyProduct,
  forgeFakeContentTypeWithShopifyProduct,
} from '../../../../__tests__/forgers';
import { COMPONENT_FIELDS, SHOPIFY_CUSTOM_FIELDS } from '../../../const';
import { getModelsFieldsMap } from '../getModelsFieldsMap';

describe('getModelFieldsMap', () => {
  const getContentTypeMock = (attributes: Record<string, any>): Schema.ContentType => {
    return {
      ...forgeFakeContentTypeWithShopifyProduct(),
      attributes,
    };
  };

  it('should return empty map when no custom fields are present', () => {
    // Arrange
    const contentTypes = {
      'api::test.test': forgeFakeContentTypeWithoutShopifyProduct(),
    };

    // Act
    const result = getModelsFieldsMap(contentTypes);

    // Assert
    expect(result.size).toBe(0);
  });

  it('should map content types with custom fields', () => {
    // Arrange
    const contentTypes = {
      'api::test.test': getContentTypeMock({
        title: { type: 'string' },
        customField: { type: 'string', customField: SHOPIFY_CUSTOM_FIELDS },
      }),
    };

    // Act
    const result = getModelsFieldsMap(contentTypes);

    // Assert
    expect(result.size).toBe(1);
    expect(result.get('api::test.test')).toEqual([{ field: 'customField', type: 'raw' }]);
  });

  it('should map content types with component fields', () => {
    // Arrange
    const contentTypes = {
      'api::test.test': getContentTypeMock({
        title: { type: 'string' },
        componentField: {
          type: COMPONENT_FIELDS.COMPONENT,
          component: 'components.test.test',
          repeatable: false,
        },
      }),
    };

    // Act
    const result = getModelsFieldsMap(contentTypes);

    // Assert
    expect(result.size).toBe(1);
    expect(result.get('api::test.test')).toEqual([
      {
        type: COMPONENT_FIELDS.COMPONENT,
        field: 'componentField',
        component: 'components.test.test',
        repeatable: false,
      },
    ]);
  });

  it('should map content types with dynamic zone fields', () => {
    // Arrange
    const contentTypes = {
      'api::test.test': getContentTypeMock({
        title: { type: 'string' },
        dynamicZone: {
          type: COMPONENT_FIELDS.DYNAMICZONE,
          components: ['components.test.test'],
        },
      }),
    };

    // Act
    const result = getModelsFieldsMap(contentTypes);

    // Assert
    expect(result.size).toBe(1);
    expect(result.get('api::test.test')).toEqual([
      {
        type: COMPONENT_FIELDS.DYNAMICZONE,
        field: 'dynamicZone',
        components: ['components.test.test'],
      },
    ]);
  });

  it('should map content types with relation fields', () => {
    // Arrange
    const contentTypes = {
      'api::test.test': getContentTypeMock({
        title: { type: 'string' },
        relationField: {
          type: COMPONENT_FIELDS.RELATION,
          target: 'api::test.test',
        },
      }),
    };

    // Act
    const result = getModelsFieldsMap(contentTypes);

    // Assert
    expect(result.size).toBe(1);
    expect(result.get('api::test.test')).toEqual([
      {
        type: 'relation',
        field: 'relationField',
        target: 'api::test.test',
      },
    ]);
  });

  it('should filter out blacklisted relations', () => {
    // Arrange
    const contentTypes = {
      'api::test.test': getContentTypeMock({
        title: { type: 'string' },
        blacklistedRelation: {
          type: COMPONENT_FIELDS.RELATION,
          target: 'plugin::users-permissions.user',
        },
      }),
    };

    // Act
    const result = getModelsFieldsMap(contentTypes);

    // Assert
    expect(result.size).toBe(0);
  });

  //   it('should handle components with custom fields', () => {
  //     // Arrange
  //     const components = {
  //       'components.test.test': getComponentMock({
  //         title: { type: 'string' },
  //         customField: { type: 'string', customField: SHOPIFY_CUSTOM_FIELDS },
  //       }),
  //     };

  //     // Act
  //     const result = getModelsWithCustomField(components);

  //     // Assert
  //     expect(result.size).toBe(1);
  //     expect(result.get('components.test.test')).toEqual([{ field: 'customField', type: 'raw' }]);
  //   });

  it('should handle invalid attributes', () => {
    // Arrange
    const contentTypes = {
      'api::test.test': getContentTypeMock({
        title: 'invalid',
        description: null,
      }),
    };

    // Act
    const result = getModelsFieldsMap(contentTypes);

    // Assert
    expect(result.size).toBe(0);
  });
});
