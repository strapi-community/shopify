import { omit, uniqBy } from 'lodash';
import { StrapiContext } from '../@types';
import { WebhookSubscriptionFormat } from '../@types/shopify';
import { BadRequestException } from '../exceptions/BadRequestException';
import { getShopsRepository } from '../repositories/shop';
import { getWebhookRepository } from '../repositories/webhook';
import { getService } from '../utils/getService';
import type { Settings, ShopifyShopWithId } from '../validators/admin.validator';

const partialHideValue = (value: string) =>
  `${value.substring(0, 3)}*****${value.substring(value.length - 1)}`;

export default ({ strapi }: StrapiContext) => {
  const shopsRepository = getShopsRepository(strapi);
  const webhookRepository = getWebhookRepository(strapi);
  const webhookService = getService(strapi, 'webhook');

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
      async getShops() {
        const shops = await shopsRepository.findMany();
        return shops.map((shop) => ({
          ...shop,
          apiKey: partialHideValue(shop.apiKey),
          apiSecretKey: partialHideValue(shop.apiSecretKey),
        }));
      },
      async addShop(shop: ShopifyShopWithId) {
        const count = await shopsRepository.count({ where: { address: shop.address } });
        if (count > 0) {
          throw new BadRequestException('Shop already exists');
        }
        const newShop = await shopsRepository.create(omit(shop, 'webhooks'));
        const hooksData = await Promise.all(
          uniqBy(shop.webhooks, 'topic').map((hook) =>
            webhookRepository.create(true, {
              ...hook,
              format: WebhookSubscriptionFormat.Json,
              shop: newShop,
            })
          )
        );

        const webhookData = await webhookService.create(shop.address, hooksData);
        if (webhookData.length) {
          await Promise.all(
            webhookData.map((data) => webhookRepository.update({ id: data.id }, data))
          );
        }

        return shopsRepository.findOne({
          where: { id: newShop.id },
          populate: { webhooks: true },
        });
      },
      async removeShop(id: number) {
        const shop = await shopsRepository.findOne({ where: { id }, populate: { webhooks: true } });
        if (!shop) {
          return;
        }
        const result = await webhookService.remove(
          shop.address,
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
          webhookRepository.remove({ where: { shop: { id } } }),
        ]);
        return removeResult;
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
            })
          )
        );
        return shopsRepository.update({ id: newShop.id }, newShop);
      },
    },
  };
};
