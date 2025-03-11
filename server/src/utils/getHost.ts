import { Core } from '@strapi/strapi';
import { get } from 'lodash';
import { getConfig } from './getConfig';

export const getHost = (strapi: Core.Strapi) =>
  get(getConfig(strapi), 'host');
