export default {
  'content-api': {
    type: 'content-api',
    routes: [
      {
        method: 'GET',
        path: '/webhooks/auth/callback',
        handler: 'webhook.handleAuthCallback',
        config: {
          auth: false,
          policies: [],
        }
      },
      {
        method: 'GET',
        path: '/webhooks/auth/oauth/callback',
        handler: 'webhook.handleAuthCallback',
        config: {
          auth: false,
          policies: [],
        }
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
      }
    ],
  },
  admin: {
    type: 'admin',
    routes: [],
  },
};
