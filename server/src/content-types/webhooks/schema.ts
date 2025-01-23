export default {
  collectionName: 'plugins_shopify_webhooks',
  info: {
    description: 'Shopify webhooks',
    singularName: 'webhook',
    pluralName: 'webhooks',
    displayName: 'Webhooks',
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
    topic: {
      type: 'string',
      required: true,
    },
    format: {
      type: 'enumeration',
      enum: ['JSON'],
      required: true,
    },
    callbackUrl: {
      type: 'string',
      required: true,
    },
    shop: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'plugin::shopify.shop',
      inversedBy: 'webhooks',
    }
  },
};
