import type { StrapiContext } from '../@types';
import { SearchProductsQuery } from '../@types/shopify';
import { ShopWithWebhooks } from '../repositories/validators';
import { getWebhookRepository } from '../repositories/webhook';
import { getService } from '../utils';
import { getProductFragment } from './shopify.gql';

export type Vendor = string;
export type Path = string;
export type Product = string;

const shopifyService = ({ strapi }: StrapiContext) => {
  const webhookService = getService(strapi, 'webhook');
  const shopService = getService(strapi, 'shop');
  const cacheService = getService(strapi, 'cache');
  const webhookRepository = getWebhookRepository(strapi);

  return {
    async init(shopsConfig: Array<ShopWithWebhooks>) {
      return Promise.all(
        shopsConfig.map(async (config) => {
          const hooks = await webhookService.create(config.vendor, config.webhooks);
          if (hooks.length) {
            await Promise.all(hooks.map((data) => webhookRepository.update({ id: data.id }, data)));
          }
        })
      );
    },
    async getProductsById(vendor: string, products: Product[]) {
      const productsIds = Array.from(new Set(products));

      const client = await shopService.getGQLClient(vendor);
      const cachedProducts = await Promise.all<SearchProductsQuery['products']['nodes'][number]>(
        productsIds.map((id) => cacheService.get(id))
      );
      const cachedProductsMap = new Map(
        cachedProducts.filter(Boolean).map((product) => [product.id, product])
      );

      const missingProducts = productsIds.filter((id, i) => !cachedProductsMap.has(id));

      const response = await client.request(
        `
              #graphql
              ${getProductFragment}
              query Products($ids: [ID!]!) {
                  nodes(ids: $ids) {
                      ... ProductFragment                  }
              }
        `,
        {
          variables: { ids: missingProducts },
          retries: 3,
        }
      );
      await Promise.all(
        response.data.nodes.map((product) => cacheService.set(product.id, product))
      );
      response.data.nodes.forEach((product) => {
        cachedProductsMap.set(product.id, product);
        return [product.id, product];
      });
      return cachedProductsMap;
    },
    async searchProducts(vendor: string, query: string) {
      const queryCacheKey = `${vendor}|${query}`;
      const cachedData = await cacheService.get(queryCacheKey);
      if (cachedData) {
        return cachedData;
      }
      const client = await shopService.getGQLClient(vendor);
      const response = await client.request(
        `
              #graphql
              ${getProductFragment}
              query searchProducts($query: String!) {
                  products(first: 20, query: $query) {
                      nodes {
                          ... ProductFragment
                      }
                      pageInfo {
                          hasNextPage
                          endCursor
                      }
                  }
              }
        `,
        {
          variables: { query },
          retries: 3,
        }
      );

      const { nodes: products, pageInfo } = response.data.products;

      // we should cache the query only if we have products
      if (products.length) {
        await Promise.all([
          cacheService.set(queryCacheKey, {
            pageInfo,
            products: products,
          }),
          ...products.map((product) => cacheService.set(product.id, product)),
        ]);
      }

      return {
        products,
        pageInfo,
      };
    },
  };
};

export default shopifyService;
export type ShopService = ReturnType<typeof shopifyService>;
