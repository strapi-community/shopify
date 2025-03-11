import { Core, UID } from '@strapi/strapi';
import { omit, uniqBy } from 'lodash';
import { StrapiContext } from '../@types';
import { WebhookSubscriptionFormat } from '../@types/shopify';
import { BadRequestException } from '../exceptions/BadRequestException';
import { getShopsRepository } from '../repositories/shop';
import { getWebhookRepository } from '../repositories/webhook';
import { getService } from '../utils/getService';
import { QueryShop, QueryShops, Settings, ShopifyShopWithId } from '../validators/admin.validator';

const partialHideValue = (value: string) =>
  `${value.substring(0, 3)}*****${value.substring(value.length - 1)}`;

export default ({ strapi }: StrapiContext) => {
  const shopsRepository = getShopsRepository(strapi);
  const webhookRepository = getWebhookRepository(strapi);
  const webhookService = getService(strapi, 'webhook');
  const shopService = getService(strapi, 'shop');

  const getMethodService = (strapi: Core.Strapi, name: UID.Service) => {
    const service = strapi.service(name);
    if (service.contentType) {
      const standardStrapiMethods = [
        'getDocumentId',
        'find',
        'createOrUpdate',
        'findOne',
        'create',
        'update',
        'delete',
      ];
      const serviceMethods = Object.keys(service);
      return standardStrapiMethods.concat(serviceMethods)
                        .filter((_: string) => typeof strapi.service(name as UID.Service)[_] === 'function');
    }
    return Object.keys(service);
  };

  return {
    settings: {
      async getSettings(hideSensitiveData = true): Promise<Settings> {
        const shops = await shopsRepository.findMany({
          where: {
            isActive: true,
          },
          populate: {
            webhooks: true,
          },
        });
        return {
          shops: shops.map((shop) => ({
            ...shop,
            apiKey: hideSensitiveData ? partialHideValue(shop.apiKey) : shop.apiKey,
            apiSecretKey: hideSensitiveData
              ? partialHideValue(shop.apiSecretKey)
              : shop.apiSecretKey,
            adminApiAccessToken: hideSensitiveData
              ? partialHideValue(shop.adminApiAccessToken)
              : shop.adminApiAccessToken,
            isActive: shop.isActive ?? false,
          })),
        };
      },
      async restore() {
        return shopsRepository.restore();
      },
    },
    shops: {
      async getShops(query: QueryShops) {
        const shops = await shopsRepository.findMany({
          where: { isActive: query.isActive },
          populate: query.populate,
        });
        return shops.map((shop) => ({
          ...shop,
          apiKey: partialHideValue(shop.apiKey),
          apiSecretKey: partialHideValue(shop.apiSecretKey),
        }));
      },
      async getShop({ id, populate }: QueryShop) {
        const shop = await shopsRepository.findOne({
          where: { id },
          populate,
        });
        if (!shop) {
          return;
        }
        return {
          ...shop,
          apiKey: partialHideValue(shop.apiKey),
          apiSecretKey: partialHideValue(shop.apiSecretKey),
          adminApiAccessToken: partialHideValue(shop.adminApiAccessToken),
        };
      },
      async addShop(shop: ShopifyShopWithId) {
        const count = await shopsRepository.count({ where: { vendor: shop.vendor } });
        if (count > 0) {
          throw new BadRequestException('Shop already exists');
        }
        return strapi.db.transaction(async () => {
          const newShop = await shopsRepository.create(omit(shop, 'webhooks'));
          const hooksData = await Promise.all(
            uniqBy(shop.webhooks, 'topic').map((hook) =>
              webhookRepository.create(true, {
                ...hook,
                format: WebhookSubscriptionFormat.Json,
                shop: newShop,
                service: hook.service,
                method: hook.method,
              }),
            ),
          );

          const webhookData = await webhookService.create(shop.vendor, hooksData);
          if (webhookData.length) {
            await Promise.all(
              webhookData.map((data) => webhookRepository.update({ id: data.id }, data)),
            );
          }

          return shopsRepository.findOne({
            where: { id: newShop.id },
            populate: { webhooks: true },
          });
        });
      },
      async removeShop(id: number) {
        const shop = await shopsRepository.findOne({ where: { id }, populate: { webhooks: true } });
        if (!shop) {
          return;
        }
        return strapi.db.transaction(async () => {
          const result = await webhookService.remove(
            shop.vendor,
            shop.webhooks.map((hook) => hook.shopifyId),
          );

          if (result.some((r) => r.hasError)) {
            await Promise.all(
              result
              .filter((r) => r.hasError)
              .map((r) => webhookRepository.update({ shopifyId: r.id }, { errors: r.errors })),
            );
            throw new BadRequestException(
              'Failed to remove shop',
              result.map((r) => `The webhook ${r.id}: ${r.errors.join(', ')}`).join(', '),
            );
          }
          const [removeResult] = await Promise.all([
            shopsRepository.remove({ where: { id } }),
            webhookRepository.remove({ where: { shop: { id } } }),
            shopService.remove(shop.vendor),
          ]);
          return {
            ...removeResult,
            apiKey: partialHideValue(shop.apiKey),
            apiSecretKey: partialHideValue(shop.apiSecretKey),
            adminApiAccessToken: partialHideValue(shop.adminApiAccessToken),
          };
        });
      },
      async updateShop(newShop: ShopifyShopWithId) {
        throw new BadRequestException('Not implemented yet');
        // TODO TBD: what we should allow when user want disable some webhook? or enable? or change callback url?
        const oldShop = await shopsRepository.findOne({
          where: { id: newShop.id },
          populate: { webhooks: true },
        });
        if (!oldShop) {
          return;
        }
        const hooksData = await Promise.all(
          uniqBy(newShop.webhooks, 'topic').map((hook) =>
            webhookRepository.create(true, {
              ...hook,
              format: WebhookSubscriptionFormat.Json,
              shop: newShop,
            }),
          ),
        );
        return shopsRepository.update({ id: newShop.id }, newShop);
      },
    },
    services: {
      getServices() {
        const services = strapi.services;
        const blackList = [
          'admin::',
          'plugin::gql',
          'plugin::i18n',
          'plugin::email',
          'plugin::upload',
          'plugin::shopify',
          'plugin::content-manager',
          'plugin::content-type-builder',
          'plugin::users-permissions',
        ];
        return Object.keys(services)
                     .filter((name) => !blackList.some((_) => name.startsWith(_)))
                     .map((name) => {
                       try {
                         return {
                           name,
                           methods: getMethodService(strapi, name as UID.Service),
                         };
                       } catch (e) {
                         return { name, methods: [] };
                       }
                     })
                     .filter((_) => _.methods.length > 0);
      },
    },
  };
};

