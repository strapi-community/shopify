import { once } from 'lodash';
import type { StrapiContext } from '../../@types';
import {
  type ShopifyShopConfig,
  type ShopifyShopWithId,
  shopSchemaWithId,
} from '../../validators/admin.validator';
import { Shop, shopValidator, ShopWithWebhooks } from '../validators';

type FindByWebhook = {
  $or: Array<{
    callbackUrl?: { $null: true };
    shopifyId?: { $null: true };
  }>;
};

type FindParams<H extends boolean = false> = {
  where?:
    | Partial<ShopifyShopWithId>
    | {
        webhooks?: FindByWebhook;
      };
  populate?: {
    webhooks?: H;
  };
};
type FindManyParams<H extends boolean = false> = FindParams<H> & {
  page?: number;
  pageSize?: number;
};

export const getShopsRepository = (strapi: StrapiContext['strapi']) => {
  const repository = strapi.query('plugin::shopify.shop');

  return {
    async create(data: ShopifyShopConfig) {
      return repository.create({ data }).then((shop) => shopValidator.create.base.parse(shop));
    },
    async findOne<H extends boolean>(
      params: FindParams<H>
    ): Promise<H extends true ? ShopWithWebhooks : Shop> {
      return repository.findOne(params).then((shop) => {
        if (!shop) {
          return null;
        }
        if (params?.populate?.webhooks) {
          return shopValidator.findOne.shopWithWebhooks.parse(shop);
        }
        return shopValidator.findOne.base.parse(shop);
      });
    },
    async findMany<WDYT extends boolean>(
      params: FindManyParams<WDYT> = {}
    ): Promise<WDYT extends true ? Array<ShopWithWebhooks> : Array<Shop>> {
      return repository.findMany(params).then((shops) => {
        if (params?.populate?.webhooks) {
          return shopValidator.findMany.shopWithWebhooks.parse(shops);
        }
        return shopValidator.findMany.base.parse(shops);
      });
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
};
