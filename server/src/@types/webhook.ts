import { WebhookSubscriptionFormat, WebhookSubscriptionTopic } from './shopify';

export type CallbackUrl = string;
export interface WebhookData {
  shopifyId: string;
  hasError: boolean;
  topic: WebhookSubscriptionTopic;
  format: WebhookSubscriptionFormat;
  callbackUrl: CallbackUrl;
}

export interface CreateWebhookSubscription {
  CREATE?: WebhookData;
  UPDATE?: WebhookData;
  REMOVE?: WebhookData;
}
