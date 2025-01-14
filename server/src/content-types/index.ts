import subscriptions from './subscriptions';

const contentTypes = {
  subscriptions,
};

export type ContentTypes = typeof contentTypes;
export type KeysContentTypes = keyof ContentTypes;
export type ShopifyContentTypes = {
  [K in KeysContentTypes]: `plugin::shopify.${K}`;
};

export default contentTypes;
