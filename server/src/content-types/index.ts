import webhook from './webhooks';
import shop from './shops';

const contentTypes = {
  webhook,
  shop,
};

export type ContentTypes = typeof contentTypes;
export type KeysContentTypes = keyof ContentTypes;
export type ShopifyContentTypes = {
  [K in KeysContentTypes]: `plugin::shopify.${K}`;
};

export default contentTypes;
