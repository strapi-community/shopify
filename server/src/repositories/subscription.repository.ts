import { Core } from '@strapi/strapi';
import { once } from 'lodash';

export const getSubscriptionRepository = once((strapi: Core.Strapi) => {
  return {
    async findOne() {},
    async create() {},
    async delete() {},
  };
});
