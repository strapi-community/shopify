import type { StrapiContext } from '../@types';
import { DeliveryMethod, LATEST_API_VERSION, shopifyApi } from '@shopify/shopify-api';
import { HOST, ShopifyWebhookTopic } from '../const/shopify';
import { getAddress } from '../utils/getAddress';

export default ({ strapi }: StrapiContext) => {
  const scopes =
    'read_apps, write_order_edits, read_order_edits, write_orders, read_orders, write_product_feeds, read_product_feeds, write_product_listings, read_product_listings, write_products, read_products, write_purchase_options, read_purchase_options';
  const shopify = shopifyApi({
    apiVersion: LATEST_API_VERSION,
    isEmbeddedApp: false,
    apiKey: '62c84611066defc5fc0ec62be2224866',
    apiSecretKey: '4fa2b1dda0e3eae9c0d557204af75d71',
    scopes: scopes.split(',').map((scope) => scope.trim()),
    hostName: HOST,
    hostScheme: 'http',
    isCustomStoreApp: true,
    adminApiAccessToken: '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',
    webhooks: {
      [ShopifyWebhookTopic.PRODUCTS_CREATE]: [
        {
          deliveryMethod: DeliveryMethod.Http,
          callbackUrl: getAddress('/webhooks/products'),
        },
      ],
    },
  });
  console.log('shopify', shopify);
  return {
    get() {
      return shopify;
    },
    webhooks: {
      list: async () => {
        const queryString = `{
  products (first: 3) {
    edges {
      node {
        id
        title
      }
    }
  }
}`;
        const session = shopify.session.customAppSession('sensinum-strapi-int.myshopify.com');
        const client = new shopify.clients.Graphql({ session });
        console.log('client', client);
        const data = await client.query({
          data: {
            query: `mutation webhookSubscriptionCreate($topic: WebhookSubscriptionTopic!, $webhookSubscription: WebhookSubscriptionInput!) {
      webhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) {
        webhookSubscription {
          id
          topic
          filter
          format
          endpoint {
            __typename
            ... on WebhookHttpEndpoint {
              callbackUrl
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }`,
            variables: {
              topic: 'PRODUCTS_UPDATE',
              webhookSubscription: {
                callbackUrl:
                  'https://abf8-95-48-69-69.ngrok-free.app/api/shopify/webhooks/products',
                format: 'JSON',
              },
            },
          },
        });
        console.log(JSON.stringify(data, null, 2));
      },
      addHandlers: async () => {
        shopify.auth.safeCompare;
        shopify.webhooks.addHandlers({
          [ShopifyWebhookTopic.PRODUCTS_CREATE]: [
            {
              deliveryMethod: DeliveryMethod.Http,
              callbackUrl: getAddress('/webhooks/products'),
            },
          ],
          [ShopifyWebhookTopic.PRODUCTS_UPDATE]: [
            {
              deliveryMethod: DeliveryMethod.Http,
              callbackUrl: getAddress('/webhooks/products'),
            },
          ],
        });
      },
    },
  };
};
