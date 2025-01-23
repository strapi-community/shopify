import { Core } from '@strapi/strapi';

export * from './webhook';

export type StrapiContext = {
  strapi: Core.Strapi;
};
