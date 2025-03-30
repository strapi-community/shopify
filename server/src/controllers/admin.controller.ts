import { isLeft } from 'fp-ts/lib/Either';
import type { StrapiContext } from '../@types';
import type { RequestContext } from '../@types/koa';
import { getService } from '../utils/getService';
import {
  getAddShopValidator, getQueryShopsValidator, getQueryShopValidator,
  getRemoveShopValidator,
  getUpdateShopValidator,
} from '../validators/admin.validator';

const controller = ({ strapi }: StrapiContext) => {
  const adminService = getService(strapi, 'admin');
  return {
    // Settings
    async getSettings() {
      return adminService.settings.getSettings();
    },
    async restore() {
      return adminService.settings.restore();
    },
    // services
    async getServices(ctx: RequestContext) {
      return adminService.services.getServices();
    },
    // Shopify shops
    async getShops(ctx: RequestContext) {
      const query = getQueryShopsValidator(ctx.query);
      if (isLeft(query)) {
        return ctx.badRequest(query.left.message, {
          issues: query.left.issues,
        });
      }
      return adminService.shops.getShops(query.right);
    },
    async getShop(ctx: RequestContext) {
      const params = getQueryShopValidator({
        ...ctx.query,
        id: ctx.params.shopId,
      });
      if (isLeft(params)) {
        return ctx.badRequest(params.left.message, {
          issues: params.left.issues,
        });
      }
      return adminService.shops.getShop(params.right);
    },
    async addShop(ctx: RequestContext) {
      const payload = getAddShopValidator({
        ...ctx.request.body,
        id: ctx.params.shopId,
      });
      if (isLeft(payload)) {
        return ctx.badRequest(payload.left.message, {
          issues: payload.left.issues,
        });
      }
      return adminService.shops.addShop(payload.right);
    },
    async removeShop(ctx: RequestContext) {
      const payload = getRemoveShopValidator({
        id: ctx.params.shopId,
      });

      if (isLeft(payload)) {
        return ctx.badRequest(payload.left.message, {
          issues: payload.left.issues,
        });
      }
      return adminService.shops.removeShop(payload.right.id);
    },
    async updateShop(ctx: RequestContext) {
      const payload = getUpdateShopValidator({
        ...ctx.request.body,
        id: ctx.params.shopId,
      });

      if (isLeft(payload)) {
        return ctx.badRequest(payload.left.message, {
          issues: payload.left.issues,
        });
      }
      return adminService.shops.updateShop(payload.right);
    },
  };
};

export default controller;

