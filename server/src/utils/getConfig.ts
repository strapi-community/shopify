import { Core } from '@strapi/strapi';
import { PluginConfig } from '../config/schema';

export const getConfig = (strapi: Core.Strapi): PluginConfig =>
  strapi.config.get('plugin::shopify');
