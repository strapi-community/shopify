import { WebhookSubscriptionFormat, WebhookSubscriptionTopic } from '../../@types/shopify';

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
    topic: {
      type: 'enumeration',
      enum: [
        WebhookSubscriptionTopic.ProductsCreate,
        WebhookSubscriptionTopic.ProductsUpdate,
        WebhookSubscriptionTopic.ProductsDelete,
        WebhookSubscriptionTopic.OrdersCreate,
        WebhookSubscriptionTopic.OrdersUpdated,
        WebhookSubscriptionTopic.OrdersDelete,
      ],
      required: true,
    },
    shopifyId: {
      type: 'string',
    },
    format: {
      type: 'enumeration',
      enum: [WebhookSubscriptionFormat.Json],
    },
    callbackUrl: {
      type: 'string',
    },
    errors: {
      type: 'json',
    },
    shop: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'plugin::shopify.shop',
      inversedBy: 'webhooks',
    },
  },
};
