import { faker } from '@faker-js/faker';
import { Shop, Webhook } from '../../src/repositories/validators';
import { WebhookSubscriptionFormat, WebhookSubscriptionTopic } from '../../src/@types/shopify';

export const forgeFakeShop = (overrides: Partial<Shop> = {}): Shop => {
  return {
    id: faker.number.int(),
    documentId: faker.string.uuid(),
    vendor: faker.company.name(),
    address: faker.internet.url(),
    apiKey: faker.string.alphanumeric(32),
    apiSecretKey: faker.string.alphanumeric(32),
    adminApiAccessToken: faker.string.alphanumeric(32),
    isActive: faker.datatype.boolean(),
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
    publishedAt: faker.date.recent().toISOString(),
    ...overrides,
  };
};

export const forgeFakeShowWithWebhooks = (
  overrides: Partial<Shop> = {}
): Shop & { webhooks: Array<Webhook> } => {
  return {
    ...forgeFakeShop(overrides),
    webhooks: forgeFakeWebhooks(),
  };
};

export const forgeFakeWebhooks = (): Array<Webhook> => {
  return Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () =>
    forgeFakeWebhook()
  ) as Array<Webhook>;
};

export const forgeFakeWebhook = (overrides: Partial<Webhook> = {}): Webhook => {
  return {
    id: faker.number.int(),
    documentId: faker.string.uuid(),
    shopifyId: faker.string.uuid(),
    topic: faker.helpers.arrayElement([
      WebhookSubscriptionTopic.ProductsCreate,
      WebhookSubscriptionTopic.ProductsUpdate,
      WebhookSubscriptionTopic.ProductsDelete,
    ]),
    format: WebhookSubscriptionFormat.Json,
    callbackUrl: faker.internet.url(),
    service: 'plugin::shopify.webhook',
    method: faker.helpers.arrayElement(['updateProduct', 'createProduct', 'deleteProduct']),
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
    publishedAt: faker.date.recent().toISOString(),
    ...overrides,
  };
};
