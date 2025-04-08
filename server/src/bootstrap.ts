import '@shopify/shopify-api/adapters/node';
import { Core } from '@strapi/strapi';
import { setupPermissions } from './permissions';
import { getShopsRepository } from './repositories/shop';
import { getService } from './utils';

const bootstrap = async ({ strapi }: { strapi: Core.Strapi }) => {
  await setupPermissions({ strapi });

  const shopifyService = getService(strapi, 'shopify');
  const shopRepository = getShopsRepository(strapi);

  const shops = await shopRepository.findMany({
    where: {
      webhooks: {
        $or: [
          {
            callbackUrl: { $null: true },
          },
          {
            shopifyId: { $null: true },
          },
        ],
      },
    },
    populate: {
      webhooks: true,
    },
  });

  if (shops.length === 0) {
    return;
  }
  await shopifyService.init(shops);
};

export default bootstrap;
