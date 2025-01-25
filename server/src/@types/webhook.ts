import { WebhookSubscriptionFormat, WebhookSubscriptionTopic } from './shopify';

export type CallbackUrl = string;
export interface WebhookData {
  id: number;
  shopifyId: string;
  topic: WebhookSubscriptionTopic;
  format: WebhookSubscriptionFormat;
  callbackUrl: CallbackUrl;
  userErrors: string[];
}

export type CreateWebhookSubscription = Record<string, WebhookData>
