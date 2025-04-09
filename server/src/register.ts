import type { Core } from '@strapi/strapi';
import { applyProductValues, getModelsFieldsMap, getShopifyFields, getService } from './utils';

import { PLUGIN_ID } from './const';

/**
 * Register the Shopify plugin
 */
const register = ({ strapi }: { strapi: Core.Strapi }) => {
  // Register custom field
  strapi.customFields.register({
    name: 'product',
    plugin: PLUGIN_ID,
    type: 'json',
  });

  const contentTypesWithCustomField = getModelsFieldsMap(strapi.contentTypes);
  const componentsWithCustomField = getModelsFieldsMap(strapi.components);

  strapi.documents.use(async (context, next) => {
    switch (context.action) {
      case 'findOne':
      case 'findMany':
        const contentType = contentTypesWithCustomField.get(context.uid);
        if (!contentType) {
          return next();
        }

        const result = await next();
        if (!result || typeof result !== 'object') {
          return result;
        }

        const shopifyService = getService(strapi, 'shopify');
        const productFields = getShopifyFields({
          contentType,
          fetchedData: result,
          contentTypes: contentTypesWithCustomField,
          components: componentsWithCustomField,
        });
        return applyProductValues(result, productFields, shopifyService);
      default:
        return next();
    }
  });
};

export default register;
