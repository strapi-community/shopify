import {
  WebhookEventBridgeEndpoint,
  WebhookHttpEndpoint,
  WebhookPubSubEndpoint,
  WebhookSubscriptionFormat,
  WebhookSubscriptionTopic,
} from '../@types/shopify';
import { StrapiContext, CallbackUrl, CreateWebhookSubscription, WebhookData } from '../@types';
import { omit } from 'lodash';
import { HOST } from '../const/shopify';
import { getService } from '../utils/getService';
import { Operation } from '../validators/admin.validator';
import {
  createAllSubscriptionMutation,
  createSingleSubscriptionMutation,
  deleteSubscription,
  getWebhooksByCallbackURL,
} from './shopify.gql.service';

export default ({ strapi }: StrapiContext) => {
  const shopService = getService(strapi, 'shop');

  async function getClient(address: string) {
    const shop = await shopService.getOrCreate(address);
    const session = await shopService.getOrCreateSession(address);
    return new shop.clients.Graphql({ session });
  }

  const extractCallbackUrl = (
    endpoint:
      | WebhookHttpEndpoint
      | Pick<WebhookPubSubEndpoint, '__typename'>
      | Pick<WebhookEventBridgeEndpoint, '__typename'>
  ): string => {
    if (endpoint.__typename === 'WebhookHttpEndpoint') {
      return endpoint.callbackUrl;
    }
    return '';
  };
  const mutationMap = {
    CREATE: WebhookSubscriptionTopic.ProductsCreate,
    UPDATE: WebhookSubscriptionTopic.ProductsUpdate,
    REMOVE: WebhookSubscriptionTopic.ProductsDelete,
  } as const;

  return {
    async create(address: string, operations: Operation[]): Promise<CreateWebhookSubscription> {
      const client = await getClient(address);
      if (operations.length === 3) {
        const { data: result } = await client.request(createAllSubscriptionMutation, {
          variables: {
            createTopic: WebhookSubscriptionTopic.ProductsCreate,
            updateTopic: WebhookSubscriptionTopic.ProductsUpdate,
            removeTopic: WebhookSubscriptionTopic.ProductsDelete,
            webhookSubscription: {
              callbackUrl: `${HOST}/api/shopify/webhooks/products`,
              format: WebhookSubscriptionFormat.Json,
            },
          },
        });
        const hasCreateErrors = result.create.userErrors.length > 0;
        const hasUpdateErrors = result.update.userErrors.length > 0;
        const hasRemoveErrors = result.remove.userErrors.length > 0;
        console.log(JSON.stringify(result, null, 2));
        return {
          CREATE: {
            shopifyId: result.create.webhookSubscription?.id,
            hasError: hasCreateErrors,
            ...omit(result.create.webhookSubscription, ['endpoint', 'id']),
            callbackUrl: extractCallbackUrl(result.create.webhookSubscription.endpoint),
          },
          UPDATE: {
            shopifyId: result.update.webhookSubscription?.id,
            hasError: hasUpdateErrors,
            ...omit(result.update.webhookSubscription, ['endpoint', 'id']),
            callbackUrl: extractCallbackUrl(result.create.webhookSubscription.endpoint),
          },
          REMOVE: {
            hasError: hasRemoveErrors,
            shopifyId: result.remove.webhookSubscription?.id,
            ...omit(result.remove.webhookSubscription, ['endpoint', 'id']),
            callbackUrl: extractCallbackUrl(result.create.webhookSubscription.endpoint),
          },
        };
      }
      const data = await Promise.all(
        operations.map(async (operation) => {
          const { data: result } = await client.request(createSingleSubscriptionMutation, {
            variables: {
              topic: mutationMap[operation.name],
              webhookSubscription: {
                callbackUrl: `${HOST}/api/shopify/webhooks/products`,
                format: WebhookSubscriptionFormat.Json,
              },
            },
          });
          return {
            [operation.name]: {
              shopifyId: result.webhookSubscriptionCreate.webhookSubscription.id,
              hasError: result.webhookSubscriptionCreate.userErrors.length > 0,
              ...omit(result.webhookSubscriptionCreate.webhookSubscription, ['endpoint', 'id']),
              callbackUrl: extractCallbackUrl(
                result.webhookSubscriptionCreate.webhookSubscription.endpoint
              ),
            },
          };
        })
      );
      return data.reduce((acc, curr) => ({ ...acc, ...curr }), {});
    },
    async validate(address: string, webhook: WebhookData[]) {
      const client = await getClient(address);
      const aggregateWebhook = webhook.reduce(
        (acc, curr) => {
          if (!acc[curr.callbackUrl]) {
            acc[curr.callbackUrl] = [];
          }
          acc[curr.callbackUrl].push(curr);
          return acc;
        },
        {} as Record<CallbackUrl, WebhookData[]>
      );
      const data = await Promise.all(
        Object.entries(aggregateWebhook).map(async ([callbackUrl, webhooks]) => {
          const { data: result } = await client.request(getWebhooksByCallbackURL, {
            variables: {
              callbackUrl,
              topics: webhooks.map((webhook) => webhook.topic),
            },
          });
          const isValid = result.webhookSubscriptions.nodes.length === webhooks.length;
          if (!isValid) {
            console.error(
              `Webhook validation failed for ${callbackUrl}. Expected ${webhooks.length} got ${result.webhookSubscriptions.nodes.length}`
            );
          }
          return {
            [callbackUrl]: isValid,
          };
        })
      );
      return data.reduce((acc, curr) => ({ ...acc, ...curr }), {});
    },
    async remove(address: string, webhookId: string) {
      const client = await getClient(address);
      const { data: result } = await client.request(deleteSubscription, {
        variables: {
          id: webhookId,
        },
      });
      return result.webhookSubscriptionDelete.deletedWebhookSubscriptionId;
    },
    async list(address: string) {
      const client = await getClient(address);
      const { data: existingWebhooks } = await client.request(getWebhooksByCallbackURL, {
        variables: {
          // TODO: extract to function
          callbackUrl: `${HOST}/api/shopify/webhooks/products`,
        },
      });
      if (!existingWebhooks.webhookSubscriptions) {
        return [];
      }
      return existingWebhooks.webhookSubscriptions.nodes;
    },
    async update(address: string) {
      const client = await getClient(address);
    },
  };
};
