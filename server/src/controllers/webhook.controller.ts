import type { StrapiContext } from '../@types';
import type { Context } from 'koa';
import UNPARSED from 'koa-body/lib/unparsed';
import { getService } from '../utils/getService';

const controller = ({ strapi }: StrapiContext) => {
  const shopifyService = getService(strapi, 'shopify');
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
      // return {};
    },
    async handleProductWebhook(ctx: Context) {
      // const { valid, ...rest } = await shopifyService.getShop().webhooks.validate({
      //   rawBody: ctx.request.body[UNPARSED],
      //   rawRequest: ctx.request,
      //   rawResponse: ctx.response,
      // });
      // console.log('valid', valid);
      // console.log('rest', rest);
      // return {};
    },
  };
};

export default controller;
