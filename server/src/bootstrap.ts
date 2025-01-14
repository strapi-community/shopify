import '@shopify/shopify-api/adapters/node';
import type { Core } from '@strapi/strapi';
import { getService } from './utils/getService';

const bootstrap = async ({ strapi }: { strapi: Core.Strapi }) => {
  const shopifyService = getService(strapi, 'shopify');
  console.log('!!shopifyService', !!shopifyService);
  await shopifyService.webhooks.addHandlers();
  await shopifyService.webhooks.list();
};

export default bootstrap;
