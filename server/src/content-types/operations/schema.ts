export default {
  collectionName: 'plugins_shopify_operations',
  info: {
    description: 'Shopify operations',
    singularName: 'operation',
    pluralName: 'operations',
    displayName: 'Shopify operation',
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
    name: {
      type: 'enumeration',
      enum: ['CREATE', 'UPDATE', 'REMOVE'],
      required: true,
    },
  },
};
