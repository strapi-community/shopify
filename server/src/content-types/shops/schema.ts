export default {
  collectionName: 'plugins_shopify_shops',
  info: {
    description: 'Shopify shops',
    singularName: 'shop',
    pluralName: 'shops',
    displayName: 'Shopify shop',
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
    address: {
      type: 'string',
      required: true,
    },
    apiKey: {
      type: 'string',
      required: true,
    },
    apiSecretKey: {
      type: 'string',
      required: true,
    },
    isActive: {
      type: 'boolean',
      required: true,
      default: false,
    },
    adminApiAccessToken: {
      type: 'string',
      required: true,
    },
    webhooks: {
      type: 'relation',
      relation: 'oneToMany',
      target: 'plugin::shopify.webhook',
      mappedBy: 'shop',
    }
  },
};
