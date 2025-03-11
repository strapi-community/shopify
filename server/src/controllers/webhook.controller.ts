import { UID } from '@strapi/strapi';
import { isLeft } from 'fp-ts/lib/Either';
import type { Context } from 'koa';
import type { StrapiContext } from '../@types';
import { getUpdateProductValidator } from '../validators/webhook.validator';

const controller = ({ strapi }: StrapiContext) => {
  return {
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
      strapi.service(webhook.service as UID.Service)?.[webhook.method]?.(ctx.request.body, result);

      return {};
    },
  };
};

export default controller;

