import { isLeft } from 'fp-ts/lib/Either';
import { z } from 'zod';
import { StrapiContext } from '../@types';
import type { RequestContext } from '../@types/koa';
import { getShopsRepository } from '../repositories/shop';
import shopifyService from '../services/shopify.service';
import { getService } from '../utils';
import { validate } from '../validators/utils';
import { right } from 'fp-ts/lib/Either';

const getQueryVendorsValidator = (vendors: string[], query: unknown) => {
  if (vendors.length === 0) {
    return validate(
      z
        .object({
          vendor: z.never(),
          q: z.string().min(2),
        })
        .safeParse(query)
    );
  }
  if (vendors.length === 1) {
    return validate(
      z
        .object({
          vendor: z.literal(vendors.at(0)).default(vendors.at(0)),
          q: z.string().min(2),
        })
        .safeParse(query)
    );
  }
  return validate(
    z
      .object({
        vendor: z.enum(vendors as [string, ...string[]]),
        q: z.string().min(3),
      })
      .safeParse(query)
  );
};

const controller = ({ strapi }: StrapiContext) => {
  const shopsRepository = getShopsRepository(strapi);
  return {
    async getVendors(ctx: RequestContext) {
      const shops = await shopsRepository.findMany({
        populate: {
          webhooks: false,
        },
      });
      ctx.body = { vendors: shops.map((_) => _.vendor) };
    },
    async getProducts(ctx: RequestContext) {
      const shops = await shopsRepository.findMany({
        populate: {
          webhooks: false,
        },
      });
      const validator = getQueryVendorsValidator(
        shops.map((_) => _.vendor),
        ctx.query
      );
      if (isLeft(validator)) {
        return ctx.badRequest(validator.left.message, {
          issues: validator.left.issues,
        });
      }
      const { vendor: vendorId, q } = validator.right;

      console.log('getProducts::', shops);
      ctx.body = await getService(strapi, 'shopify').searchProducts(vendorId, q);
    },
  };
};
export default controller;
