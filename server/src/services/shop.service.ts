import { LATEST_API_VERSION, type Session, type Shopify, shopifyApi } from '@shopify/shopify-api';
import { getShopsRepository } from '../repositories/shop';
import { getHost } from '../utils/getHost';
import { ShopifyShopConfig } from '../validators/admin.validator';

export default () => {
  const shopCache = new Map<string, Shopify>();
  const sessionCache = new Map<string, Session>();
  const scopes = [
    'read_apps',
    'write_order_edits',
    'read_order_edits',
    'write_orders',
    'read_orders',
    'write_product_feeds',
    'read_product_feeds',
    'write_product_listings',
    'read_product_listings',
    'write_products',
    'read_products',
    'write_purchase_options',
    'read_purchase_options',
  ] as const;

  function getShop(shopifyShop: ShopifyShopConfig) {
    const api = shopifyApi({
      apiVersion: LATEST_API_VERSION,
      isEmbeddedApp: false,
      apiKey: shopifyShop.apiKey,
      apiSecretKey: shopifyShop.apiSecretKey,
      adminApiAccessToken: shopifyShop.adminApiAccessToken,
      scopes: scopes.map((scope) => scope.trim()),
      hostName: getHost(strapi),
      hostScheme: 'http',
      isCustomStoreApp: true,
    });
    shopCache.set(shopifyShop.address, api);
    return api;
  }

  return {
    async getConfig(address: string) {
      return getShopsRepository(strapi).findOne({ where: { address } });
    },
    getOrCreateWithConfig(shopifyShop: ShopifyShopConfig) {
      if (shopCache.has(shopifyShop.address)) {
        return shopCache.get(shopifyShop.address);
      }
      return getShop(shopifyShop);
    },
    async getOrCreate(address: string) {
      if (shopCache.has(address)) {
        return shopCache.get(address);
      }
      const shopifyShop = await this.getConfig(address);
      if (!shopifyShop) {
        throw new Error('Shop not found');
      }
      return getShop(shopifyShop);
    },
    remove(address: string) {
      return shopCache.delete(address);
    },
    async getOrCreateSession(address: string) {
      if (sessionCache.has(address)) {
        const session = sessionCache.get(address);
        if (!session.isExpired()) {
          return session;
        }
      }
      const shop = await this.getOrCreate(address);
      const appSession = shop.session.customAppSession(new URL(address).hostname);

      sessionCache.set(address, appSession);
      return appSession;
    },
  };
};
