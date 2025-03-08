import { getFetchClient } from '@strapi/strapi/admin';
import { once } from 'lodash';
import {
  NewShopSchemaWithIdSchema,
  ServiceSchema,
  serviceSchema,
  ShopSchemaWithIdSchema,
  shopSchemaWithIdSchema,
} from '../validators/shop.validator';

const URL_PREFIX = 'shopify';

export type ApiClient = ReturnType<typeof getApiClient>;

export const getApiClient = once((fetch: ReturnType<typeof getFetchClient>) => ({
  getIndexPrefix() {
    return [URL_PREFIX];
  },

  readAll() {
    return fetch
      .get(`/${URL_PREFIX}/settings/shops`)
      .then(({ data }) => shopSchemaWithIdSchema.array().parse(data));
  },

  readAllIndex() {
    return [URL_PREFIX, 'shops'];
  },

  createShop(body: NewShopSchemaWithIdSchema): Promise<ShopSchemaWithIdSchema> {
    return fetch
      .post(`/${URL_PREFIX}/settings/shops`, body)
      .then(({ data }) => shopSchemaWithIdSchema.parse(data));
  },

  getReadShopIndex(id: number) {
    return [URL_PREFIX, 'shops', id];
  },
  readShop(id: number): Promise<ShopSchemaWithIdSchema> {
    const query = new URLSearchParams();

    query.append('populate[webhooks]', 'true');

    return fetch
      .get(`/${URL_PREFIX}/settings/shops/${id}?${query.toString()}`)
      .then(({ data }) => shopSchemaWithIdSchema.parse(data))
      .then((shop) => ({
        ...shop,
        webhooks: shop.webhooks?.map((webhook) => ({ ...webhook, isPersisted: true })),
      }));
  },

  updateShop(body: ShopSchemaWithIdSchema): Promise<ShopSchemaWithIdSchema> {
    return fetch
      .put(`/${URL_PREFIX}/settings/shops/${body.id}`, body)
      .then(({ data }) => shopSchemaWithIdSchema.parse(data));
  },

  deleteShop(body: ShopSchemaWithIdSchema): Promise<void> {
    return fetch.del(`/${URL_PREFIX}/settings/shops/${body.id}`).then(() => {});
  },

  readServicesIndex() {
    return [URL_PREFIX, 'services'];
  },
  readServices(): Promise<Array<ServiceSchema>> {
    return fetch
      .get(`/${URL_PREFIX}/settings/services`)
      .then(({ data }) => serviceSchema.array().parse(data));
  },
}));
