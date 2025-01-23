import type { StrapiContext } from '../@types';
import { BadRequestException } from '../exceptions/BadRequestException';
import { getOperationsRepository } from '../repositories/operation.reporitory';
import { getShopsRepository } from '../repositories/shop.repository';
import { getWebhookRepository } from '../repositories/webhook.repository';
import { getService } from '../utils/getService';
import type { Settings, ShopifyShopConfig, ShopifyShopWithId } from '../validators/admin.validator';

const partialHideValue = (value: string) =>
  `${value.substring(0, 3)}*****${value.substring(value.length - 1)}`;

const checkIfValueContainsAsterisk = (value: string) => value.includes('*');

export default ({ strapi }: StrapiContext) => {
  const shopsRepository = getShopsRepository(strapi);
  const operationsRepository = getOperationsRepository(strapi);
  const webhookRepository = getWebhookRepository(strapi);
  const webhookService = getService(strapi, 'webhook');

  const checkShopSettingsContainsAsterisk = (shop: ShopifyShopConfig) =>
    checkIfValueContainsAsterisk(shop.apiKey) || checkIfValueContainsAsterisk(shop.apiSecretKey);

  return {
    settings: {
      async getSettings(hideSensitiveData = true): Promise<Settings> {
        const shops = await shopsRepository.findMany({
          where: {
            isActive: true,
          },
          populate: {
            operations: true,
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
        const attachedOperations = await operationsRepository.findMany({
          where: { name: { $in: shop.operations.map((operation) => operation.name) } },
        });
        const newShop = await shopsRepository.create({
          ...shop,
          operations: attachedOperations,
        });
        const createWebhookSubscription = await webhookService.create(
          shop.address,
          attachedOperations
        );
        await webhookRepository.createMany(
          Object.values(createWebhookSubscription)
            .filter((_) => _.hasError)
            .map((webhook) => {
              return {
                ...webhook,
                shop: newShop,
              };
            })
        );

        return shopsRepository.findOne({
          where: { id: newShop.id },
          populate: { operations: true, webhooks: true },
        });
      },
      async removeShop(id: number) {
        return shopsRepository.remove({ where: { id } });
      },
      async updateShop(newShop: ShopifyShopWithId) {
        return shopsRepository.update({ id: newShop.id }, newShop);
      },
    },
  };
};
