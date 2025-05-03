import { z } from 'zod';
import { getTradId } from '../translations';

export const validTopics = ['PRODUCTS_CREATE', 'PRODUCTS_UPDATE', 'PRODUCTS_DELETE'] as const;

export type TopicSchema = z.infer<typeof topicSchema>;
export const topicSchema = z.enum(validTopics);

export type WebhookSchema = z.infer<typeof webhookSchema>;
export const webhookSchema = z
  .object({
    topic: z.string(),
    method: z.string().optional().nullable(),
    service: z
      .string()
      .regex(
        /^admin::|api::[a-zA-Z0-9_\-]+\.[a-zA-Z0-9_\-]+|plugin::[a-zA-Z0-9_\-]+\.[a-zA-Z0-9_]\-+$/,
        getTradId('form.shop.webhooks.serviceInvalidNameError')
      )
      .optional()
      .nullable(),
    isPersisted: z.boolean().optional(),
  })
  .superRefine((webhook, ctx) => {
    if (webhook.service && !webhook.method) {
      ctx.addIssue({
        path: ['method'],
        message: getTradId('form.shop.webhooks.inconsistentConfigError'),
        code: z.ZodIssueCode.custom,
      });
    }
  });

export type ShopSchema = z.infer<typeof shopSchema>;
export const shopSchema = z.object({
  documentId: z.string(),
  address: z.string().url(),
  vendor: z.string(),
  apiKey: z.string().optional(),
  apiSecretKey: z.string(),
  adminApiAccessToken: z.string(),
  isActive: z.boolean().default(true),
  createdAt: z.string(),
  updatedAt: z.string(),
  publishedAt: z.string(),
  locale: z.string().array().nullable().optional(),
  webhooks: webhookSchema.array().optional(),
});

export type ShopSchemaWithIdSchema = z.infer<typeof shopSchemaWithIdSchema>;
export const shopSchemaWithIdSchema = shopSchema.extend({
  id: z.union([
    z.number().min(1),
    z
      .string()
      .min(1)
      .refine((val) => !isNaN(Number(val)), {
        message: 'String must be a valid number',
      }),
  ]),
});

export type NewShopSchemaWithIdSchema = z.infer<typeof newShopSchemaWithIdSchema>;
export const newShopSchemaWithIdSchema = shopSchemaWithIdSchema.omit({
  documentId: true,
  createdAt: true,
  publishedAt: true,
  updatedAt: true,
});

// TODO: target schema
export type ShopProductSchema = z.infer<typeof shopProductSchema>;
export const shopProductSchema = z.object({
  id: z.string(),
  title: z.string(),
});

export type ServiceSchema = z.infer<typeof serviceSchema>;
export const serviceSchema = z.object({
  name: z.string(),
  methods: z.string().array(),
});

export type NewShopFormSchema = z.infer<typeof shopSchema>;
export const newShopFormSchema = newShopSchemaWithIdSchema
  .omit({
    id: true,
    address: true,
    vendor: true,
    apiKey: true,
    apiSecretKey: true,
    adminApiAccessToken: true,
  })
  .extend({
    id: z.union([
      z.number().min(1),
      z
        .string()
        .min(1)
        .refine((val) => !isNaN(Number(val)), {
          message: 'String must be a valid number',
        }),
    ]),
    address: z
      .string({ message: getTradId('form.shop.address.errorRequired') })
      .url({ message: getTradId('form.shop.address.errorUrl') }),
    vendor: z.string({ message: getTradId('form.shop.vendor.errorRequired') }),
    apiKey: z
      .string({ message: getTradId('form.shop.apiKey.errorRequired') })
      .length(32, getTradId('form.shop.apiKey.errorLength'))
      .optional(),
    apiSecretKey: z
      .string({ message: getTradId('form.shop.apiSecretKey.errorLength') })
      .length(32, getTradId('form.shop.apiSecretKey.errorLength')),
    adminApiAccessToken: z
      .string({ message: getTradId('form.shop.adminApiAccessToken.errorRequired') })
      .length(38, getTradId('form.shop.adminApiAccessToken.errorLength'))
      .regex(/shpat_[a-zA-Z0-9]{32}/, getTradId('form.shop.adminApiAccessToken.errorFormat')),
  });

const blur = '*****';

export type EditShopFormSchema = z.infer<typeof shopSchema>;
export const editShopFormSchema = shopSchemaWithIdSchema
  .omit({
    id: true,
    apiKey: true,
    apiSecretKey: true,
    adminApiAccessToken: true,
  })
  .extend({
    id: z.union([
      z.number().min(1),
      z
        .string()
        .min(1)
        .refine((val) => !isNaN(Number(val)), {
          message: 'String must be a valid number',
        }),
    ]),
    apiKey: z
      .string({ message: getTradId('form.shop.apiKey.errorRequired') })
      .refine((value) => (value.length === 32 || value.includes(blur) ? true : false), {
        message: getTradId('form.shop.apiKey.errorLength'),
      })
      .optional(),
    apiSecretKey: z
      .string({ message: getTradId('form.shop.apiSecretKey.errorRequired') })
      .refine((value) => (value.length === 32 || value.includes(blur) ? true : false), {
        message: getTradId('form.shop.apiSecretKey.errorLength'),
      }),
    adminApiAccessToken: z
      .string({ message: getTradId('form.shop.adminApiAccessToken.errorRequired') })
      .refine((value) => (value.length === 38 || value.includes(blur) ? true : false), {
        message: getTradId('form.shop.adminApiAccessToken.errorLength'),
      })
      .refine(
        (value) => (/shpat_[a-zA-Z0-9]{32}/.test(value) || value.includes(blur) ? true : false),
        {
          message: getTradId('form.shop.adminApiAccessToken.errorFormat'),
        }
      ),
  });
