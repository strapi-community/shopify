import { Core } from '@strapi/strapi';
import { Services } from '../services';
import { getPlugin } from './getPlugin';

export const getService = <S extends keyof Services>(
  strapi: Core.Strapi,
  serviceName: S
): Services[S] => getPlugin(strapi).service(serviceName);
