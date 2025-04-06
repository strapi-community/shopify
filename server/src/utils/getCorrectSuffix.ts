import { AvailableTopic, WebhookSubscriptionTopic } from '../@types/shopify';
import { HOOK_TYPE } from '../const';

export const getCorrectSuffix = (topic: AvailableTopic) => {
  switch (topic) {
    case WebhookSubscriptionTopic.ProductsCreate:
    case WebhookSubscriptionTopic.ProductsUpdate:
    case WebhookSubscriptionTopic.ProductsDelete:
      return HOOK_TYPE.COMMON.pathSuffix;
    default:
      throw new Error('Invalid topic');
  }
};
