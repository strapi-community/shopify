import { once } from 'lodash';
import type { StrapiContext } from '../@types';
import { Operation, operationSchemaWithId, shopSchemaWithId } from '../validators/admin.validator';

type FindParams = {
  where?: {
    [key in keyof Operation]?: Operation[key] | { $in: Operation[key][] };
  };
};

export const getOperationsRepository = once((strapi: StrapiContext['strapi']) => {
  const repository = strapi.query('plugin::shopify.operation');

  return {
    async create(data: Operation) {
      return repository.create({ data }).then((op) => shopSchemaWithId.parse(op));
    },
    async createMany(data: Operation[]) {
      return repository.createMany({ data });
    },
    async findMany(params: FindParams = {}) {
      return repository.findMany(params).then((op) => operationSchemaWithId.array().parse(op));
    },
    async count(params?: FindParams) {
      return repository.count(params);
    },
  };
});
