import { getShopsRepository } from '../repositories/shop.repository';
import type { StrapiContext } from '../@types';
import { getService } from '../utils/getService';
import { ShopifyShopConfig } from '../validators/admin.validator';

export default ({ strapi }: StrapiContext) => {
  const shopService = getService(strapi, 'shop');
  const webhookService = getService(strapi, 'webhook');
  const shopsRepository = getShopsRepository(strapi);

  return {
    async init(shopsConfig: Array<ShopifyShopConfig>) {
      return Promise.all(
        shopsConfig.map(async (config) => {
          const existingWebhooks = await webhookService.list(config.address);
          console.log('existingWebhooks', existingWebhooks);
          console.log('existingWebhooks', existingWebhooks);
          console.log('existingWebhooks', existingWebhooks);

          await Promise.all(
            existingWebhooks.map(async (webhook) => {
              await webhookService.remove(config.address, webhook.id);
            })
          );
          await shopsRepository.remove({ where: { address: config.address } });

          // const newHooks = await webhookService.create(config.address, config.operations);
          // console.log('newHooks', newHooks);
        })
      );
    },
    async list() {
      // const session = shopify.session.customAppSession('sensinum-strapi-int.myshopify.com');
      // const client = new shopify.clients.Graphql({ session });
      // const data = await client.request(createSubscriptionMutation, {
      //   variables: {
      //     topic: WebhookSubscriptionTopic.ProductsUpdate,
      //     webhookSubscription: {
      //       callbackUrl: 'https://abf8-95-48-69-69.ngrok-free.app/api/shopify/webhooks/products',
      //       format: WebhookSubscriptionFormat.Json,
      //     },
      //   },
      // });
      // const update = await client.request(updateSubscription, {
      //   variables: {
      //     id: data.data.webhookSubscriptionCreate.webhookSubscription.id,
      //     webhookSubscription: {
      //       callbackUrl: 'https://abf8-95-48-69-69.ngrok-free.app/api/shopify/webhooks/products',
      //       format: WebhookSubscriptionFormat.Json,
      //     },
      //   },
      // });
    },
    getWebhooks(shop: ShopifyShopConfig) {
      // const session = shopify.session.customAppSession(shop.address);
      // const client = new shopify.clients.Graphql({ session });
    },
    async addHandlers() {
      // console.log(shops);
      // for (const shop of shops) {
      //   const session = shopify.session.customAppSession(shop.address);
      //   const client = new shopify.clients.Rest({ session });
      //   const address = getAddress(strapi, shop.shopName);
      //   const data = await client.webhook.create({
      //     topic: ShopifyWebhookTopic.OrdersCreate,
      //     address,
      //     deliveryMethod: DeliveryMethod.Http,
      //   });
      //   strapi.log.info(`Webhook for ${shop.shopName} created: ${data.id}`);
      // }
    },
  };
};
