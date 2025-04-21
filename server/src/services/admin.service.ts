import { Core, UID } from '@strapi/strapi';
import { differenceWith, omit, omitBy, uniqBy } from 'lodash';
import { StrapiContext } from '../@types';
import { WebhookSubscriptionFormat } from '../@types/shopify';
import { BadRequestException } from '../exceptions/BadRequestException';
import { getShopsRepository } from '../repositories/shop';
import { Shop, ShopWithWebhooks, Webhook } from '../repositories/validators';
import { getWebhookRepository } from '../repositories/webhook';
import { getService } from '../utils';
import { QueryShop, QueryShops, Settings, ShopifyShopWithId } from '../validators/admin.validator';

const partialHideValue = (value: string) =>
  `${value.substring(0, 3)}*****${value.substring(value.length - 1)}`;

export default ({ strapi }: StrapiContext) => {
  const shopsRepository = getShopsRepository(strapi);
  const webhookRepository = getWebhookRepository(strapi);
  const webhookService = getService(strapi, 'webhook');
  const shopService = getService(strapi, 'shop');

  const getMethodService = (strapi: Core.Strapi, service: Core.Service, name: string) => {
    if (service?.contentType) {
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
      return standardStrapiMethods
        .concat(serviceMethods)
        .filter(
          (method: string) => typeof strapi.service(name as UID.Service)[method] === 'function'
        );
    }
    return Object.keys(service || {});
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
            apiKey: hideSensitiveData ? partialHideValue(shop.apiKey || '') : shop.apiKey,
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
          where: query.isActive ? { isActive: query.isActive } : {},
          populate: query.populate,
          page: query.page,
          pageSize: query.pageSize,
        });
        return shops.map((shop: Shop | ShopWithWebhooks) => ({
          ...shop,
          adminApiAccessToken: partialHideValue(shop.adminApiAccessToken),
          apiKey: partialHideValue(shop.apiKey || ''),
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
          apiKey: partialHideValue(shop.apiKey || ''),
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
              })
            )
          );

          const webhookData = await webhookService.create(shop.vendor, hooksData);
          if (webhookData.length) {
            await Promise.all(
              webhookData.map((data) => webhookRepository.update({ id: data.id }, data))
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
          throw new BadRequestException('Shop not found');
        }
        return strapi.db.transaction(async () => {
          const result = await webhookService.remove(
            shop.vendor,
            shop.webhooks.map((hook) => hook.shopifyId)
          );

          if (result.some((r) => r.hasError)) {
            await Promise.all(
              result
                .filter((r) => r.hasError)
                .map((r) => webhookRepository.update({ shopifyId: r.id }, { errors: r.errors }))
            );
            throw new BadRequestException(
              'Failed to remove shop',
              result.map((r) => `The webhook ${r.id}: ${r.errors.join(', ')}`).join(', ')
            );
          }
          const [removeResult] = await Promise.all([
            shopsRepository.remove({ where: { id } }),
            webhookRepository.removeMany({
              where: {
                id: {
                  $in: shop.webhooks.map((hook) => hook.id),
                },
              },
            }),
            shopService.remove(shop.vendor),
          ]);
          return {
            ...removeResult,
            apiKey: partialHideValue(shop.apiKey || ''),
            apiSecretKey: partialHideValue(shop.apiSecretKey),
            adminApiAccessToken: partialHideValue(shop.adminApiAccessToken),
          };
        });
      },
      async updateShop(newShop: ShopifyShopWithId) {
        const oldShop = await shopsRepository.findOne({
          where: { id: newShop.id },
          populate: { webhooks: true },
        });
        if (!oldShop) {
          throw new BadRequestException('Shop not found');
        }
        const comparator = (
          newW: Pick<Webhook, 'service' | 'topic' | 'method' | 'shopifyId'>,
          oldW: Pick<Webhook, 'service' | 'topic' | 'method' | 'shopifyId'>
        ) => {
          if (newW.topic === oldW.topic) {
            return newW.service === oldW.service && newW.method === oldW.method;
          }
          return false;
        };
        const diffToAdd = differenceWith(newShop.webhooks, oldShop.webhooks, comparator);
        const diffToRemove = differenceWith(oldShop.webhooks, newShop.webhooks, comparator);
        return strapi.db.transaction(async () => {
          if (diffToAdd.length || diffToRemove.length) {
            if (diffToRemove.length > 0) {
              await webhookService.remove(
                newShop.vendor,
                diffToRemove.map((_) => _.shopifyId)
              );
              const removedWebhook = oldShop.webhooks.filter((hook) =>
                diffToRemove.some((r) => r.shopifyId === hook.shopifyId)
              );
              await webhookRepository.removeMany({
                where: {
                  id: {
                    $in: removedWebhook.map((hook) => hook.id),
                  },
                },
              });
            }
            if (diffToAdd.length > 0) {
              const hooksData = await Promise.all(
                uniqBy(diffToAdd, 'topic').map((hook) =>
                  webhookRepository.create(true, {
                    ...hook,
                    format: WebhookSubscriptionFormat.Json,
                    shop: newShop,
                    service: hook.service,
                    method: hook.method,
                  })
                )
              );
              const webhookData = await webhookService.create(oldShop.vendor, hooksData);

              if (webhookData.length) {
                await Promise.all(
                  webhookData.map((data) => webhookRepository.update({ id: data.id }, data))
                );
              }
            }
          }

          return shopsRepository.update(
            { id: oldShop.id },
            {
              ...omit(newShop, ['webhooks']),
              ...omit(oldShop, ['webhooks']),
              ...omitBy(newShop, (value, key) => {
                if (['webhooks', 'id', 'vendor'].includes(key)) {
                  return true;
                }
                return !value || (typeof value === 'string' && value.includes('***'));
              }),
            }
          );
        });
      },
    },
    services: {
      getServices() {
        const services = strapi.services;
        const blackList = [
          'admin::',
          'plugin::gql',
          'plugin::graphql',
          'plugin::i18n',
          'plugin::email',
          'plugin::upload',
          'plugin::shopify',
          'plugin::content-manager',
          'plugin::content-type-builder',
          'plugin::users-permissions',
        ];
        return Object.entries(services)
          .filter(([name]) => !blackList.some((_) => name.startsWith(_)))
          .map(([name, service]) => {
            try {
              return {
                name,
                methods: getMethodService(strapi, service, name),
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
