import { ApiType, shopifyApiProject } from '@shopify/api-codegen-preset';

const config = shopifyApiProject({
  apiType: ApiType.Admin,
  apiVersion: '2025-01',
  documents: ['./server/**/*.{ts,tsx}'],
  outputDir: './server/src/shopify',
})
console.log(JSON.stringify(config, null, 2));
// https://github.com/Shopify/shopify-app-js/blob/main/packages/api-clients/api-codegen-preset/README.md#configuration
module.exports = {
  // For syntax highlighting / auto-complete when writing operations
  // https://shopify.dev/admin-graphql-proxy
  schema: 'https://shopify.dev/admin-graphql-direct-proxy/2025-10',
  documents: ['./server/**/*.{ts,tsx}'],
  projects: {
    default: shopifyApiProject({
      apiType: ApiType.Admin,
      apiVersion: '2025-01',
      documents: ['./server/**/*.{ts,tsx}'],
      outputDir: './server/src/@types/shopify',
      declarations: false,
    }),
  },
};
