import type { Core } from '@strapi/strapi';
import { applyProductValues, getModelsWithCustomField, getProductFields, getService } from './utils';

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
};

export default register;
