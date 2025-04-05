import { faker } from '@faker-js/faker';
import type { Schema } from '@strapi/strapi';
import type { Attribute } from '@strapi/types/dist/schema';
import { SHOPIFY_CUSTOM_FIELDS } from '../../src/const';

const baseAttributes: Schema.ContentType['attributes'] = {
  name: {
    type: 'string' as const,
    required: true,
  },
  description: {
    type: 'text' as const,
    required: true,
  },
  price: {
    type: 'integer' as const,
  },
};

const shopifyProductAttributes = {
  type: 'customField' as const,
  customField: SHOPIFY_CUSTOM_FIELDS,
} as unknown as Attribute.Attribute;

export const forgeFakeContentTypes = (): Array<Schema.ContentType> => [
  forgeFakeContentTypeWithoutShopifyProduct(),
  forgeFakeContentTypeWithShopifyProduct(),
];
export const forgeFakeContentTypeWithoutShopifyProduct = (
  attributes: Schema.ContentType['attributes'] = baseAttributes
): Schema.ContentType => ({
  uid: 'api::random.random',
  attributes,
  modelType: 'contentType',
  modelName: 'test',
  globalId: 'api::random.random',
  kind: 'collectionType',
  info: {
    displayName: 'Random',
    singularName: 'random',
    pluralName: 'randoms',
    description: '',
  },
});
const attributesWithShopify = {
  ...baseAttributes,
  product: shopifyProductAttributes as any,
  [faker.lorem.word()]: {
    type: 'component',
    component: 'unit.test',
  },
  [faker.lorem.word()]: {
    type: 'component',
    component: 'unit.test',
    repeatable: true,
  },
  [faker.lorem.word()]: {
    type: 'component',
    component: 'unit.nested',
    repeatable: true,
  },
  [faker.lorem.word()]: {
    type: 'component',
    component: 'unit.nested-repeatable',
    repeatable: true,
  },
  [faker.lorem.word()]: {
    type: 'dynamiczone',
    dynamiczone: ['unit.test', 'unit.nested', 'unit.nested-repeatable', 'unit.random'],
  },
};
export const forgeFakeContentTypeWithShopifyProduct = (
  attributes: Schema.ContentType['attributes'] = attributesWithShopify
): Schema.ContentType => ({
  uid: 'api::product.product',
  globalId: 'api::product.product',
  kind: 'collectionType',
  modelName: 'product',
  collectionName: 'products',
  modelType: 'contentType',
  info: {
    singularName: 'product',
    pluralName: 'products',
    displayName: 'Product',
    description: '',
  },
  attributes,
});

export const forgeBaseComponent = (): Schema.Component => ({
  uid: 'unit.random',
  attributes: {
    ...baseAttributes,
  },
  modelType: 'component',
  category: 'test',
  modelName: 'test',
  globalId: 'unit.random',
  info: {
    displayName: 'Random',
  },
});

export const forgeWithCustomFieldComponent = (): Schema.Component => ({
  uid: 'unit.test',
  attributes: {
    ...baseAttributes,
    product: shopifyProductAttributes as any,
  },
  modelType: 'component',
  category: 'test',
  modelName: 'test',
  globalId: 'unit.test',
  info: {
    displayName: 'Test',
  },
});

export const forgeWitchCustomFieldAndNestedComponent = (): Schema.Component => ({
  uid: 'unit.nested',
  attributes: {
    ...baseAttributes,
    product: shopifyProductAttributes as any,
    nested: {
      type: 'component',
      component: 'unit.test',
    },
  },
  modelType: 'component',
  category: 'test',
  modelName: 'test',
  globalId: 'unit.nested',
  info: {
    displayName: 'Nested',
  },
});
export const forgeWithCustomFieldAndRepeatableNestComponent = (): Schema.Component => ({
  uid: 'unit.nested-repeatable',
  globalId: 'unit.nested-repeatable',
  attributes: {
    ...baseAttributes,
    product: shopifyProductAttributes as any,
    nestedRepeatable: {
      type: 'component',
      component: 'unit.test',
      repeatable: true,
    },
  },
  modelType: 'component',
  category: 'test',
  modelName: 'test',
  info: {
    displayName: 'Nested Repeatable',
  },
});

export const forgeFakeComponents = (): Array<Schema.Component> => [
  forgeBaseComponent(),
  forgeWithCustomFieldComponent(),
  forgeWitchCustomFieldAndNestedComponent(),
  forgeWithCustomFieldAndRepeatableNestComponent(),
];
