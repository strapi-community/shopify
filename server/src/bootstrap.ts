import '@shopify/shopify-api/adapters/node';
import type { Core } from '@strapi/strapi';
import { getService } from './utils/getService';
import { getOperationsRepository } from './repositories/operation.reporitory';

const bootstrap = async ({ strapi }: { strapi: Core.Strapi }) => {
  const shopifyService = getService(strapi, 'shopify');
  const adminService = getService(strapi, 'admin');
  const operationRepository = getOperationsRepository(strapi);
  const [{ shops }, isInitialized] = await Promise.all([
    adminService.settings.getSettings(false),
    operationRepository.count(),
  ]);

  if (isInitialized === 0) {
    await operationRepository.createMany([
      { name: 'CREATE' },
      { name: 'UPDATE' },
      { name: 'REMOVE' },
    ]);
  }
  if (shops.length === 0) {
    strapi.log.warn('No Shopify shops found. Skipping Shopify service initialization.');
    return;
  }

  await shopifyService.init(shops);
};

export default bootstrap;
