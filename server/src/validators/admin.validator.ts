import { z } from 'zod';
import { shopValidator, webhookValidator } from '../repositories/validators';
import { validate } from './utils';

const createHookSchema = webhookValidator.create.base.pick({ topic: true });

const createShopSchema = shopValidator.create.base
  .pick({
    address: true,
    apiKey: true,
    apiSecretKey: true,
    adminApiAccessToken: true,
    isActive: true,
  })
  .merge(z.object({ webhooks: z.array(createHookSchema) }));

export const shopSchemaWithId = shopValidator.create.base
  .pick({ id: true })
  .merge(createShopSchema);

export type ShopifyShopConfig = z.infer<typeof createShopSchema>;

export type ShopifyShopWithId = z.infer<typeof shopSchemaWithId>;

const settingsSchema = z.object({
  shops: z.array(createShopSchema),
});

export type Settings = z.infer<typeof settingsSchema>;

export const getAddShopValidator = (payload: unknown) =>
  validate(createShopSchema.safeParse(payload));

const zodObject = shopSchemaWithId.omit({ address: true, webhooks: true }).merge(z.object({webhooks: z.array(createHookSchema)}));
type UpdateShop = z.infer<typeof zodObject>;
export const getUpdateShopValidator = (payload: unknown) => validate(zodObject.safeParse(payload));

export const getRemoveShopValidator = (payload: unknown) =>
  validate(shopSchemaWithId.pick({ id: true }).safeParse(payload));
