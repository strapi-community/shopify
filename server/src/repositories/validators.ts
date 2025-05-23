import { z } from 'zod';
import { WebhookSubscriptionFormat, WebhookSubscriptionTopic } from '../@types/shopify';
import { nullable } from '../validators/utils';

// WEBHOOK VALIDATOR

const webhookRestAPISchema = z.object({
  topic: z.enum([
    // PRODUCTS
    WebhookSubscriptionTopic.ProductsCreate,
    WebhookSubscriptionTopic.ProductsUpdate,
    WebhookSubscriptionTopic.ProductsDelete,
  ]),
  method: z.string().optional().nullable(),
  service: z
    .string()
    .regex(
      /^admin::|api::[a-zA-Z0-9_\-]+\.[a-zA-Z0-9_\-]+|plugin::[a-zA-Z0-9_\-]+\.[a-zA-Z0-9_\-]+$/,
      'Invalid service name allowed values: admin::, api::[a-zA-Z0-9_\\-]+\.[a-zA-Z0-9_\\-]+, plugin::[a-zA-Z0-9_\\-]+\\.[a-zA-Z0-9_\\-]+'
    )
    .optional()
    .nullable(),
});

const refinedWebhookRestAPISchema = webhookRestAPISchema.superRefine((data, ctx) => {
  if (data.method && !data.service) {
    ctx.addIssue({
      message: 'Method cannot be defined without a service',
      code: 'custom',
      path: ['method'],
    });
  }
  if (!data.method && data.service) {
    ctx.addIssue({
      message: 'Service cannot be defined without a method',
      code: 'custom',
      path: ['service'],
    });
  }
});
export const webhookBase = z
  .object({
    id: z.number(),
    documentId: z.string(),
    shopifyId: z.string().nullable(),
    format: z.enum([WebhookSubscriptionFormat.Json]),
    callbackUrl: z.string().nullable(),
    createdAt: z.string().nullable().optional(),
    updatedAt: z.string().nullable().optional(),
    publishedAt: z.string().nullable().optional(),
    locale: z.string().nullable().optional(),
    errors: z.string().array().nullable().optional(),
  })
  .merge(webhookRestAPISchema);

const webhookWithShopId = webhookBase.merge(z.object({ shop: z.object({ id: z.number() }) }));
const webhookShopifyCreating = webhookBase.pick({
  id: true,
  shopifyId: true,
  topic: true,
  format: true,
  callbackUrl: true,
  errors: true,
});

export const webhookValidator = {
  create: {
    restData: refinedWebhookRestAPISchema,
    base: webhookBase,
    withShopId: webhookWithShopId,
    draft: webhookBase.pick({
      id: true,
      documentId: true,
      topic: true,
      service: true,
      method: true,
    }),
  },
  findOne: {
    base: webhookBase,
    partial: nullable(webhookBase),
  },
  findMany: {
    base: webhookBase.array(),
  },
};
export type Webhook = z.infer<(typeof webhookValidator)['create']['base']>;
export type WebhookWithShopId = z.infer<(typeof webhookValidator)['create']['withShopId']>;
export type DraftWebhook = z.infer<(typeof webhookValidator)['create']['draft']>;
export type WebhookData = z.infer<typeof webhookShopifyCreating>;

// SHOP VALIDATOR

const shopBase = z.object({
  id: z
    .union([
      z.number().min(1),
      z
        .string()
        .min(1)
        .refine((val) => !isNaN(Number(val)), {
          message: 'String must be a valid number',
        }),
    ])
    .transform((val) => Number(val)),
  documentId: z.string(),
  address: z.string().url('The address must be a valid URL.'),
  vendor: z.string(),
  apiKey: z.string().optional().nullable(),
  // .refine((data) => !data.includes('*'), { message: 'API key cannot contain asterisks.' }),
  apiSecretKey: z.string(),
  // .refine((data) => !data.includes('*'), { message: 'API secret key cannot contain asterisks.' }),
  adminApiAccessToken: z.string(),
  // .refine((data) => !data.includes('*'), { message: 'API secret key cannot contain asterisks.' }),
  isActive: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),
  publishedAt: z.string(),
  locale: z.string().array().nullable().optional(),
});
const shopWithWebhooks = z.lazy(() => {
  return shopBase.merge(
    z.object({
      webhooks: z.array(webhookBase),
    })
  );
});
export const shopValidator = {
  create: {
    base: shopBase,
  },
  findOne: {
    shopWithWebhooks,
    base: shopBase,
  },
  findMany: {
    shopWithWebhooks: shopWithWebhooks.array(),
    base: shopBase.array(),
  },
};
export type Shop = z.infer<(typeof shopValidator)['create']['base']>;
export type ShopWithWebhooks = z.infer<(typeof shopValidator)['findOne']['shopWithWebhooks']>;
