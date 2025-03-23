import { UID } from '@strapi/types';
import type { StrapiContext } from '../@types';
import { ShopWithWebhooks } from '../repositories/validators';
import { getWebhookRepository } from '../repositories/webhook';
import { getService } from '../utils';

export type Vendor = string;
export type Path = string;
export type Product = string;
const productFragment = `
    #graphql
    fragment ProductFragment on Product {
        id
        tags
        title
        handle
        createdAt
        updatedAt
        description
        descriptionHtml
        translations(locale: "en") {
            locale
            key
            value
            market {
                id
                name
                metafields(first: 10) {
                    nodes {
                        id
                        key
                        value
                    }
                }
            }
        }
        priceRangeV2 {
            maxVariantPrice {
                amount
                currencyCode
            }
            minVariantPrice {
                amount
                currencyCode
            }
        }
        variants(first: 100) {
            nodes {
                id
                title
                updatedAt
                createdAt
                displayName
                availableForSale
                barcode
                compareAtPrice
                image {
                    id
                    altText
                    url
                    metafields(first: 10) {
                        nodes {
                            id
                            key
                            value
                        }
                    }
                }
            }
        }
        featuredMedia {
            id
            alt
            preview {
                image {
                    url
                }
            }
        }
        category {
            id
            name
            isRoot
            isArchived
        }
        media(first: 10) {
            nodes {
                id
                alt
                preview {
                    image {
                        url
                    }
                }
            }
        }
    }
`

const shopifyService = ({ strapi }: StrapiContext) => {
  const webhookService = getService(strapi, 'webhook');
  const shopService = getService(strapi, 'shop');
  const webhookRepository = getWebhookRepository(strapi);

  return {
    async init(shopsConfig: Array<ShopWithWebhooks>) {
      return Promise.all(
        shopsConfig.map(async (config) => {
          const hooks = await webhookService.create(config.address, config.webhooks);
          if (hooks.length) {
            await Promise.all(hooks.map((data) => webhookRepository.update({ id: data.id }, data)));
          }
        })
      );
    },
    async getProductsById(vendor: string, products: Product[]) {
      const client = await shopService.getGQLClient(vendor);
      const response = await client.request(
        `
              #graphql
              ${productFragment}
              query Products($ids: [ID!]!) {
                  nodes(ids: $ids) {
                      ... ProductFragment                  }
              }
        `,
        {
          variables: { ids: Array.from(new Set(products)) },
          retries: 3,
        }
      );
      return new Map(response.data.nodes.map((product) => [product.id, product]));
    },
    async searchProducts(vendor: string, query: string) {
      const client = await shopService.getGQLClient(vendor);
      const response = await client.request(
        `
              #graphql
              ${productFragment}
              query SearchProducts($query: String!) {
                  products(first: 50, query: $query) {
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

      return {
        products: response.data.products.nodes,
        pageInfo: response.data.products.pageInfo,
      };
    },
  };
};

export default shopifyService;
export type ShopService = ReturnType<typeof shopifyService>;
