import { Core } from '@strapi/strapi';

export const getConfig = (strapi: Core.Strapi, path: 'accessToken' | 'accessKey' | 'secretKey'): string => {
  return strapi.config.get(`plugin::shopify.${path}`);
}
