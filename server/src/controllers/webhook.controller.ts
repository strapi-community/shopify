import { UID } from '@strapi/strapi';
import { isLeft } from 'fp-ts/lib/Either';
import type { Context } from 'koa';
import type { StrapiContext } from '../@types';
import { getUpdateProductValidator } from '../validators/webhook.validator';

/**
 * Webhook Controller
 *
 * All incoming Shopify webhook requests are validated using the shop's `apiSecretKey` (HMAC signature)
 * via Shopify's official SDK. Only requests with a valid signature are processed; all others are rejected.
 */
const getWebhookController = ({ strapi }: StrapiContext) => {
  // const cacheService = getService(strapi, 'cache');
  return {
    /**
     * Handles incoming Shopify webhook requests.
     * Validates the request signature using the shop's apiSecretKey (Shopify SDK).
     * Only valid, signed requests are processed.
     */
    async handleWebhook(ctx: Context) {
      const vendor = ctx.request.body.vendor;

      if (!vendor) {
        strapi.log.error('No vendor found in the webhook request body');
        return {};
      }

      const validationResult = await getUpdateProductValidator(strapi, vendor, ctx);

      if (isLeft(validationResult)) {
        strapi.log.error('Validation failed', validationResult.left);
        return {};
      }

      const { result, webhook } = validationResult.right;
      // we can't cache the webhook data because the webhook data is not the same as we get from the GQL API :(
      // call the service method with the webhook data
      // const cacheKey = ctx.request.body.admin_graphql_api_id;
      // const productId = ctx.request.body.id;
      // const cachedData = { ...result, id: productId };
      // cacheService.set(cacheKey, cachedData);

      strapi.service(webhook.service as UID.Service)?.[webhook.method]?.(ctx.request.body, result);

      return {};
    },
  };
};

export default getWebhookController;

