export default {
  collectionName: 'plugins_shopify_subscriptions',
  info: {
    name: 'subscriptions',
    description: 'subscriptions',
  },
  options: {
    draftAndPublish: false,
  },
  pluginOptions: {
    'content-manager': {
      visible: false,
    },
    'content-type-builder': {
      visible: false,
    },
  },
  attributes: {
    shopifyId: {
      type: 'string',
      required: true,
    },
    shopifySubscriptionId: {
      type: 'string',
      required: true,
    },
    shopifySubscriptionUrl: {
      type: 'string',
      required: true,
    },
  },
};
