import type { Context } from 'koa';
import type { StrapiContext } from '../@types';
import { getService } from '../utils/getService';

const controller = ({ strapi }: StrapiContext) => {
  const shopifyService = getService(strapi, 'shop');
  return {
    handleAuthCallback: async (ctx: Context) => {
      console.log('handleAuthCallback');
    },
    async handleOrderWebhook(ctx: Context) {
      // const bodyElement = ctx.request.body[UNPARSED];
      // const { valid, ...rest } = await shopifyService.getShop().webhooks.validate({
      //   rawBody: bodyElement,
      //   rawRequest: ctx.request,
      //   rawResponse: ctx.response,
      // });
      // console.log('valid', valid);
      // console.log('rest', rest);
      return {};
    },
    async handleProductWebhook(ctx: Context) {
      console.log('ctx.request.body', ctx.request.body);
      const vendor = ctx.request.body.vendor;
      if (!vendor) {
        strapi.log.error('No vendor found in the webhook request body');
        return {};
      }

      // const { valid, ...rest } = await shopifyService.getOrCreate('').webhooks.validate({
      //   rawBody: ctx.request.body[UNPARSED],
      //   rawRequest: ctx.request,
      //   rawResponse: ctx.response,
      // });
      // console.log('valid', valid);
      // console.log('rest', rest);
      return {};
    },
  };
};

export default controller;
