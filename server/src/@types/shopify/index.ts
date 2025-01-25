import { WebhookSubscriptionTopic } from './admin.types';

export * from './admin.generated';
export * from './admin.types';

export type AvailableTopic =
  | WebhookSubscriptionTopic.ProductsCreate
  | WebhookSubscriptionTopic.ProductsUpdate
  | WebhookSubscriptionTopic.ProductsDelete
  | WebhookSubscriptionTopic.OrdersCreate
  | WebhookSubscriptionTopic.OrdersUpdated
  | WebhookSubscriptionTopic.OrdersDelete;
