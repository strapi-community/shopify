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
    path: '/webhooks/orders',
    handler: 'webhook.handleOrderWebhook',
    config: {
      auth: false,
      policies: [],
    },
  },
  {
    method: 'POST',
    path: '/webhooks/products',
    handler: 'webhook.handleProductWebhook',
    config: {
      auth: false,
      policies: [],
    },
  },
];

export default routes;
