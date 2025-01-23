import type { RequestContext } from '../@types/koa';
import type { StrapiContext } from '../@types';
import { getService } from '../utils/getService';
import {
  getAddShopValidator,
  getRemoveShopValidator,
  getSaveSettingsValidator,
  getUpdateShopValidator,
} from '../validators/admin.validator';
import { isLeft } from 'fp-ts/lib/Either';

const controller = ({ strapi }: StrapiContext) => {
  const adminService = getService(strapi, 'admin');
  // Settings
  return {
    async getSettings() {
      return adminService.settings.getSettings();
    },
    async restore() {
      return adminService.settings.restore();
    },
    // Shop
    async getShops() {
      return adminService.shops.getShops();
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
