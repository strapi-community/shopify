import { z } from 'zod';
import { validate } from './utils';

const idDefinition = z.object({
  id: z.union([z.number(), z.string()]).transform((data) => Number(data)),
});

const operationSchema = z.object({ name: z.enum(['CREATE', 'UPDATE', 'REMOVE']) });

export const operationSchemaWithId = operationSchema.merge(idDefinition);

const shopSchema = z.object({
  address: z.string().url('The address must be a valid URL.'),
  apiKey: z
    .string()
    .refine((data) => !data.includes('*'), { message: 'API key cannot contain asterisks.' }),
  apiSecretKey: z
    .string()
    .refine((data) => !data.includes('*'), { message: 'API secret key cannot contain asterisks.' }),
  adminApiAccessToken: z
    .string()
    .refine((data) => !data.includes('*'), { message: 'API secret key cannot contain asterisks.' }),
  isActive: z.boolean().default(false),
  operations: z.array(operationSchema).default([]),
});

export type Operation = z.infer<typeof operationSchema>;

export const shopSchemaWithId = shopSchema.merge(idDefinition);

export type ShopifyShopConfig = z.infer<typeof shopSchema>;

export type ShopifyShopWithId = z.infer<typeof shopSchemaWithId>;

const settingsSchema = z.object({
  shops: z.array(shopSchema),
});

export const getSaveSettingsValidator = (payload: unknown) =>
  validate(settingsSchema.safeParse(payload));

export type Settings = z.infer<typeof settingsSchema>;

export const getAddShopValidator = (payload: unknown) => validate(shopSchema.safeParse(payload));

export const getUpdateShopValidator = (payload: unknown) =>
  validate(shopSchemaWithId.omit({ address: true }).safeParse(payload));

export const getRemoveShopValidator = (payload: unknown) =>
  validate(shopSchemaWithId.pick({ id: true }).safeParse(payload));


export const shopifyWebhookSchema = z.object({
  topic: z.string().nonempty(),
  format: z.enum(['JSON']),
  callbackUrl: z.string().url('The callback URL must be a valid URL.'),
  shopifyId: z.string().nonempty(),
});

export const shopifyWebhookWithIdSchema = shopifyWebhookSchema.merge(idDefinition);

export type ShopifyWebhook = z.infer<typeof shopifyWebhookSchema>;
export type ShopifyWebhookWithId = z.infer<typeof shopifyWebhookWithIdSchema>;
