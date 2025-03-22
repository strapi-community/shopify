import { PLUGIN_ID } from '../const/shopify';
import shop from './shops';
import webhook from './webhooks';

const contentTypes = {
  webhook,
  shop,
};

export type ContentTypes = typeof contentTypes;
export type KeysContentTypes = keyof ContentTypes;
export type ShopifyContentTypes = {
  [K in KeysContentTypes]: `plugin::${typeof PLUGIN_ID}.${K}`;
};

export default contentTypes;
