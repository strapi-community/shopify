import { LATEST_API_VERSION, type Session, type Shopify, shopifyApi } from '@shopify/shopify-api';
import { getShopsRepository } from '../repositories/shop';
import type { Shop } from '../repositories/validators';
import { getHost } from '../utils';
import { ShopifyShopConfig } from '../validators/admin.validator';

type CachedShopData = { shop: Shopify; config: Shop };
export default () => {
  const shopCache = new Map<string, CachedShopData>();
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

  function getShop(shopifyShopConfig: ShopifyShopConfig) {
    const api = shopifyApi({
      apiVersion: LATEST_API_VERSION,
      isEmbeddedApp: false,
      apiKey: shopifyShopConfig.apiKey,
      apiSecretKey: shopifyShopConfig.apiSecretKey,
      adminApiAccessToken: shopifyShopConfig.adminApiAccessToken,
      scopes: scopes.map((scope) => scope.trim()),
      hostName: getHost(strapi),
      hostScheme: 'http',
      isCustomStoreApp: true,
    });
    shopCache.set(shopifyShopConfig.vendor, { shop: api, config: shopifyShopConfig });
    return api;
  }

  return {
    async getConfig(vendor: string) {
      return getShopsRepository(strapi).findOne({ where: { vendor } });
    },
    getOrCreateWithConfig(shopifyShop: ShopifyShopConfig) {
      if (shopCache.has(shopifyShop.vendor)) {
        return shopCache.get(shopifyShop.vendor);
      }
      return getShop(shopifyShop);
    },
    async getOrCreateShop(vendor: string): Promise<CachedShopData> {
      if (shopCache.has(vendor)) {
        return shopCache.get(vendor);
      }
      const shopifyConfig = await this.getConfig(vendor);
      if (!shopifyConfig) {
        throw new Error('Shop not found');
      }
      return {
        config: shopifyConfig,
        shop: getShop(shopifyConfig),
      };
    },
    remove(vendor: string) {
      shopCache.delete(vendor);
      sessionCache.delete(vendor);
    },
    async getOrCreateSession(vendor: string, cachedShopData?: CachedShopData) {
      if (sessionCache.has(vendor)) {
        const session = sessionCache.get(vendor);
        if (!session.isExpired()) {
          return session;
        }
      }
      const { shop, config } = cachedShopData ?? await this.getOrCreateShop(vendor);
      const appSession = shop.session.customAppSession(new URL(config.address).hostname);
      sessionCache.set(vendor, appSession);
      return appSession;
    },

    async getGQLClient(vendor: string) {
      const shopData = await this.getOrCreateShop(vendor);
      const session = await this.getOrCreateSession(vendor, shopData);

      return new shopData.shop.clients.Graphql({ session });
    },
    async getRestClient(vendor: string) {
      const shopData = await this.getOrCreateShop(vendor);
      const session = await this.getOrCreateSession(vendor, shopData);

      return new shopData.shop.clients.Rest({ session });
    },
  };
};
