import { HOOK_TYPE } from '../const/shopify';
import { StrapiRoute } from './types';

const routes: StrapiRoute<'webhook'>[] = [
  {
    method: 'GET',
    path: '/webhooks/auth/callback',
    handler: 'webhook.handleAuthCallback',
    config: {
      auth: false,
      policies: [],
    },
  },
  {
    method: 'GET',
    path: '/webhooks/auth/oauth/callback',
    handler: 'webhook.handleAuthCallback',
    config: {
      auth: false,
      policies: [],
    },
  },
  {
    method: 'POST',
    path: HOOK_TYPE.ORDER.pathSuffix.replace('/api/shopify', ''),
    handler: 'webhook.handleOrderWebhook',
    config: {
      auth: false,
      policies: [],
    },
  },
  {
    method: 'POST',
    path: HOOK_TYPE.PRODUCT.pathSuffix.replace('/api/shopify', ''),
    handler: 'webhook.handleProductWebhook',
    config: {
      auth: false,
      policies: [],
    },
  },
];

export default routes;
