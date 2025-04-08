import { getFetchClient } from '@strapi/strapi/admin';
import { once } from 'lodash';
import { z } from 'zod';
import { PLUGIN_ID as URL_PREFIX } from '../pluginId';
import {
  NewShopSchemaWithIdSchema,
  ServiceSchema,
  serviceSchema,
  ShopProductSchema,
  shopProductSchema,
  ShopSchemaWithIdSchema,
  shopSchemaWithIdSchema,
} from '../validators/shop.validator';

export type ApiClient = ReturnType<typeof getApiClient>;

export const getApiClient = once((fetch: ReturnType<typeof getFetchClient>) => ({
  getIndexPrefix: () => [URL_PREFIX],

  readAll: () =>
    fetch
      .get(`/${URL_PREFIX}/settings/shops`)
      .then(({ data }) => shopSchemaWithIdSchema.array().parse(data)),

  readAllIndex: () => [URL_PREFIX, 'shops'],

  createShop: (body: NewShopSchemaWithIdSchema): Promise<ShopSchemaWithIdSchema> =>
    fetch
      .post(`/${URL_PREFIX}/settings/shops`, body)
      .then(({ data }) => shopSchemaWithIdSchema.parse(data)),

  getReadShopIndex: (id: number) => [URL_PREFIX, 'shops', id],
  readShop: (id: number): Promise<ShopSchemaWithIdSchema> => {
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

  getReadVendorsIndex: () => [URL_PREFIX, 'vendors'],
  readVendors: (): Promise<Array<string>> => {
    return fetch
      .get(`/${URL_PREFIX}/content-manager/vendors`)
      .then(({ data }) => z.object({ vendors: z.string().array() }).parse(data))
      .then(({ vendors }) => vendors);
  },

  getReadShopProductsIndex: ({ vendor, query }: { vendor: string; query: string }) => [
    URL_PREFIX,
    'vendors',
    vendor,
    query,
    'products',
  ],
  readShopProducts: ({
    vendor,
    query,
  }: {
    vendor: string;
    query: string;
  }): Promise<Array<ShopProductSchema>> => {
    const searchParams = new URLSearchParams();

    searchParams.append('q', query);
    searchParams.append('vendor', vendor.toString());

    return fetch
      .get(`/${URL_PREFIX}/content-manager/products?${searchParams.toString()}`)
      .then(({ data }) => z.object({ products: shopProductSchema.array() }).parse(data))
      .then(({ products }) => products);
  },

  updateShop: (body: ShopSchemaWithIdSchema): Promise<ShopSchemaWithIdSchema> =>
    fetch
      .put(`/${URL_PREFIX}/settings/shops/${body.id}`, body)
      .then(({ data }) => shopSchemaWithIdSchema.parse(data)),

  deleteShop: (body: ShopSchemaWithIdSchema): Promise<void> =>
    fetch.del(`/${URL_PREFIX}/settings/shops/${body.id}`).then(() => {}),

  readServicesIndex: () => [URL_PREFIX, 'services'],
  readServices: (): Promise<Array<ServiceSchema>> =>
    fetch
      .get(`/${URL_PREFIX}/settings/services`)
      .then(({ data }) => serviceSchema.array().parse(data)),
}));
