import type { Core } from '@strapi/strapi';
import { applyProductValues, getModelsWithCustomField, getProductFields, getService } from './utils';

import { PLUGIN_ID } from './const/shopify';

/**
 * Register the Shopify plugin
 */
const register = ({ strapi }: { strapi: Core.Strapi }) => {
  // Register custom field
  strapi.customFields.register({
    name: 'product',
    plugin: 'shopify',
    type: 'json',
  });

  const contentTypesWithCustomField = getModelsWithCustomField(strapi.contentTypes);
  const componentsWithCustomField = getModelsWithCustomField(strapi.components);

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
        const productFields = getProductFields({
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

  strapi.customFields.register({
    name: `${PLUGIN_ID}_product`,
    plugin: PLUGIN_ID,
    type: 'string',
    inputSize: {
      default: 4,
      isResizable: true,
    },
  });
};

export default register;
