import { Core } from '@strapi/strapi';
import { left, right } from 'fp-ts/lib/Either';
import type { Context } from 'koa';
import UNPARSED from 'koa-body/lib/unparsed';
import { getShopsRepository } from '../repositories/shop';
import { getService } from '../utils/getService';

/**
 * Webhook Validator
 *
 * Validates incoming Shopify webhook requests using the shop's `apiSecretKey` (HMAC signature)
 * via Shopify's official SDK. Only requests with a valid signature are processed; all others are rejected.
 */

/**
 * Validates a Shopify product webhook request for a given vendor.
 * Uses the shop's apiSecretKey (Shopify SDK) to check the request signature.
 * Only valid, signed requests are processed.
 */
export const getUpdateProductValidator = async (
  strapi: Core.Strapi,
  vendor: string,
  ctx: Context,
) => {
  const shopRepository = getShopsRepository(strapi);
  const shopService = getService(strapi, 'shop');
  const shop = await shopRepository.findOne({
    where: { vendor },
    populate: {
      webhooks: true,
    },
  });
  if (!shop || (shop && shop.webhooks.length === 0)) {
    return left('Shop not found');
  }

  const { shop: shopifyShop } = await shopService.getOrCreateShop(vendor);
  const result = await shopifyShop.webhooks.validate({
    rawBody: ctx.request.body[UNPARSED],
    rawRequest: ctx.request,
    rawResponse: ctx.response,
  });
  if (!result.valid) {
    return left('Validation failed');
  }

  const webhook = shop.webhooks.find((hook) => hook.topic === result.topic);
  if (!webhook) {
    return left('Webhook not found');
  }

  return right({
    result,
    webhook,
  });
};
