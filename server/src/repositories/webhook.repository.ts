import { Core } from '@strapi/strapi';
import { once } from 'lodash';
import {
  ShopifyWebhook,
  ShopifyWebhookWithId,
  shopifyWebhookWithIdSchema,
} from '../validators/admin.validator';

type FindParams = {
  where?: {
    [key in keyof ShopifyWebhookWithId]?: ShopifyWebhookWithId[key];
  };
};

export const getWebhookRepository = once((strapi: Core.Strapi) => {
  const repository = strapi.query('plugin::shopify.webhook');

  return {
    async findOne(params: Required<FindParams>) {
      return repository
        .findOne(params)
        .then((w) => (w ? shopifyWebhookWithIdSchema.parse(w) : null));
    },
    async create(data: ShopifyWebhook) {
      return repository.create({ data }).then((w) => shopifyWebhookWithIdSchema.parse(w));
    },
    async createMany(data: ShopifyWebhook[]) {
      return repository.createMany({ data })
    },
    async remove(params: Required<FindParams>) {
      return repository.delete(params);
    },
    async findMany(params: FindParams = {}) {
      return repository.findMany(params).then((op) => shopifyWebhookWithIdSchema.array().parse(op));
    },
  };
});
