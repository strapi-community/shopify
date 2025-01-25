import { Core } from '@strapi/strapi';
import { once } from 'lodash';
import { DraftWebhook, Webhook, webhookValidator, WebhookWithShopId } from '../validators';

type FindParams = {
  where?:
    | Partial<Webhook>
    | {
        shop: {
          id: number;
        };
      };
};

export const getWebhookRepository = once((strapi: Core.Strapi) => {
  const repository = strapi.query('plugin::shopify.webhook');

  return {
    async findOne(params: Required<FindParams>) {
      return repository
        .findOne(params)
        .then((w) => (w ? webhookValidator.findOne.base.parse(w) : null));
    },
    async create<T extends boolean>(
      isDraft: T,
      data: Webhook | WebhookWithShopId
    ): Promise<T extends true ? DraftWebhook : Webhook> {
      return repository.create({ data }).then((w) => {
        if (isDraft) {
          return webhookValidator.create.draft.parse(w);
        }
        return webhookValidator.create.base.parse(w);
      });
    },
    async update(where: FindParams['where'], data: Partial<Webhook>) {
      return repository.update({ where, data }).then((w) => {
        if (!w) {
          return null;
        }
        if (w.errors) {
          return webhookValidator.findOne.partial.parse(w);
        }
        return webhookValidator.findOne.base.parse(w);
      });
    },

    async remove(params: Required<FindParams>) {
      return repository.delete(params);
    },
    async findMany(params: FindParams = {}) {
      return repository.findMany(params).then((op) => webhookValidator.findMany.base.parse(op));
    },
  };
});
