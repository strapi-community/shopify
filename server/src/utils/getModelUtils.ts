import type { Core } from '@strapi/strapi';
import type { KeysContentTypes } from '../content-types';
import { getPlugin } from './getPlugin';

export const getModelUtils = (strapi: Core.Strapi, name: KeysContentTypes) =>
  getPlugin(strapi).contentType(name)?.uid;
