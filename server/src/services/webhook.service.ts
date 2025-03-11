import { omit } from 'lodash';
import { CallbackUrl, StrapiContext } from '../@types';
import {
  CreateAllProductsMutation,
  WebhookEventBridgeEndpoint,
  WebhookHttpEndpoint,
  WebhookPubSubEndpoint,
  WebhookSubscriptionFormat,
} from '../@types/shopify';
import { WebhookData, WebhookWithShopId } from '../repositories/validators';
import { getCorrectSuffix } from '../utils/getCorrectSuffix';
import { getHost } from '../utils/getHost';
import { getService } from '../utils/getService';
import {
  createSingleSubscriptionMutation,
  deleteSubscription,
  getWebhooksByCallbackURL,
} from './shopify.gql';

export default ({ strapi }: StrapiContext) => {
  const shopService = getService(strapi, 'shop');



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

  const formatData = (
    id: number,
    result:
      | CreateAllProductsMutation['create']
      | CreateAllProductsMutation['update']
      | CreateAllProductsMutation['remove']
  ): WebhookData => {
    return {
      ...omit(result.webhookSubscription || {}, ['endpoint', 'id']),
      id,
      shopifyId: result.webhookSubscription?.id,
      errors: result.userErrors.map((error) => error.message ?? error),
      callbackUrl: extractCallbackUrl(result.webhookSubscription.endpoint),
    } as WebhookData;
  };

  return {

    async create(vendor: string, hooks: WebhookWithShopId[]): Promise<WebhookData[]> {
      // TODO: please don't remove this code, it is usefully for testing
      // return Promise.all(hooks.map(async (hook) => {
      //   return {
      //     id: hook.id,
      //     topic: hook.topic,
      //     // callbackUrl: `${getHost(strapi)}${HOOK_TYPE.PRODUCT.pathSuffix}`,
      //     // format: WebhookSubscriptionFormat.Json,
      //     // shopifyId: '123',
      //     errors: ['sssdd'],
      //   } as WebhookData
      // }));
      const client = await shopService.getGQLClient(vendor);
      return Promise.all(
        hooks.map(async (hook) => {
          const { data: result } = await client.request(createSingleSubscriptionMutation, {
            variables: {
              topic: hook.topic,
              webhookSubscription: {
                callbackUrl: `${getHost(strapi)}${getCorrectSuffix(hook.topic)}`,
                format: WebhookSubscriptionFormat.Json,
              },
            },
          });
          return formatData(hook.id, result.webhookSubscriptionCreate);
        })
      );
    },
    async validate(vendor: string, webhook: WebhookData[]) {
      const client = await shopService.getGQLClient(vendor);
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
    async remove(vendor: string, webhookId: string[]) {
      const client = await shopService.getGQLClient(vendor);
      console.log('client', client);
      const result = await Promise.all(
        webhookId.map(async (id) => {
          const { data: result } = await client.request(deleteSubscription, {
            variables: {
              id,
            },
          });
          return {
            ...result.webhookSubscriptionDelete,
            id,
          };
        })
      );
      return result.map((data) => ({
        id: data.id,
        hasError: !!data.userErrors.length,
        errors: data.userErrors.map((error) => error.message ?? error) as string[],
      }));
    },
  };
};
