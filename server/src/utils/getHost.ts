import { Core } from '@strapi/strapi';

export const getHost = (strapi: Core.Strapi): string => strapi.config.get(`plugin::shopify.host`);
