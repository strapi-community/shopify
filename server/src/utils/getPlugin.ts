import { Core } from '@strapi/strapi';

export const getPlugin = (strapi: Core.Strapi) => strapi.plugin('shopify');
