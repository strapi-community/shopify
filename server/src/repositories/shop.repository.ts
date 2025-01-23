import { once } from 'lodash';
import {
  shopSchemaWithId,
  type ShopifyShopConfig,
  type ShopifyShopWithId,
} from '../validators/admin.validator';
import type { StrapiContext } from '../@types';

type FindParams = {
  where?: {
    [key in keyof ShopifyShopWithId]?: ShopifyShopWithId[key];
  };
  populate?: {
    operations?: boolean;
    webhooks?: boolean;
  };
};

export const getShopsRepository = once((strapi: StrapiContext['strapi']) => {
  const repository = strapi.query('plugin::shopify.shop');

  return {
    async create(data: ShopifyShopConfig) {
      return repository.create({ data }).then((shop) => shopSchemaWithId.parse(shop));
    },
    async findOne(params: FindParams) {
      return repository.findOne(params).then((shop) => shopSchemaWithId.parse(shop));
    },
    async findMany(params: FindParams = {}) {
      return repository.findMany(params).then((shops) => shopSchemaWithId.array().parse(shops));
    },
    async remove(params: { where: Required<FindParams>['where'] }) {
      return repository.delete(params);
    },
    async update(criteria: FindParams['where'], shop: ShopifyShopWithId) {
      return repository
        .update({ where: criteria, data: shop })
        .then((shop) => shopSchemaWithId.parse(shop));
    },
    async restore() {
      return repository.deleteMany();
    },
    async count(params: FindParams) {
      return repository.count(params);
    },
  };
});
