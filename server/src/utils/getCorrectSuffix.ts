import { AvailableTopic, WebhookSubscriptionTopic } from '../@types/shopify';
import { HOOK_TYPE } from '../const/shopify';

export const getCorrectSuffix = (topic: AvailableTopic) => {
  switch (topic) {
    case WebhookSubscriptionTopic.ProductsCreate:
    case WebhookSubscriptionTopic.ProductsUpdate:
    case WebhookSubscriptionTopic.ProductsDelete:
      return HOOK_TYPE.PRODUCT.pathSuffix;
    case WebhookSubscriptionTopic.OrdersCreate:
    case WebhookSubscriptionTopic.OrdersUpdated:
    case WebhookSubscriptionTopic.OrdersDelete:
      return HOOK_TYPE.ORDER.pathSuffix;
    default:
      throw new Error('Invalid topic');
  }
};
