import { UID } from '@strapi/strapi';
import { isLeft } from 'fp-ts/lib/Either';
import type { Context } from 'koa';
import type { StrapiContext } from '../@types';
import { getUpdateProductValidator } from '../validators/webhook.validator';
// import { getService } from '../utils/getService';

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
      // call the service method with the webhook data
      // TODO: add cache for the webhook data
      // cacheService.set(webhook.id, result);
      strapi.service(webhook.service as UID.Service)?.[webhook.method]?.(ctx.request.body, result);

      return {};
    },
  };
};

export default getWebhookController;

