import { z } from 'zod';
import { shopValidator, webhookValidator } from '../repositories/validators';
import { validate } from './utils';

const stringToBoolean = z
  .string()
  .toLowerCase()
  .transform((val) => (val ? val === 'true' : val))
  .pipe(z.boolean());

const createShopSchema = shopValidator.create.base
  .pick({
    vendor: true,
    address: true,
    apiKey: true,
    apiSecretKey: true,
    adminApiAccessToken: true,
    isActive: true,
  })
  .merge(z.object({ webhooks: z.array(webhookValidator.create.restData) }));

export const shopSchemaWithId = shopValidator.create.base
  .pick({ id: true })
  .merge(createShopSchema);

export type ShopifyShopConfig = z.infer<typeof createShopSchema>;

export type ShopifyShopWithId = z.infer<typeof shopSchemaWithId>;

const settingsSchema = z.object({
  shops: z.array(createShopSchema),
});

export type Settings = z.infer<typeof settingsSchema>;

const queryShopsSchema = z.object({
  isActive: stringToBoolean.optional(),
  populate: z.object({ webhooks: stringToBoolean.optional() }).optional(),
  page: z.number().min(1).optional().default(1),
  pageSize: z.number().min(1).optional().default(10),
});

export const getQueryShopsValidator = (payload: unknown) =>
  validate(queryShopsSchema.safeParse(payload));

export type QueryShops = z.infer<typeof queryShopsSchema>;

const shopSchemaWithWebhooks = shopValidator.create.base
  .pick({ id: true })
  .merge(queryShopsSchema.omit({ isActive: true, page: true, pageSize: true }));
export const getQueryShopValidator = (payload: unknown) =>
  validate(shopSchemaWithWebhooks.safeParse(payload));

export type QueryShop = z.infer<typeof shopSchemaWithWebhooks>;

export const getAddShopValidator = (payload: unknown) =>
  validate(createShopSchema.safeParse(payload));

const zodObject = shopSchemaWithId
  .omit({ address: true, webhooks: true })
  .merge(z.object({ webhooks: z.array(webhookValidator.create.restData) }));
type UpdateShop = z.infer<typeof zodObject>;
export const getUpdateShopValidator = (payload: unknown) => validate(zodObject.safeParse(payload));

export const getRemoveShopValidator = (payload: unknown) =>
  validate(shopSchemaWithId.pick({ id: true }).safeParse(payload));
