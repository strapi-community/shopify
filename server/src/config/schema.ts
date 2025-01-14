import { z } from 'zod';
export const schemaConfig = z.object({
  accessToken: z.string().nonempty('Access token is required'),
  accessKey: z.string().nonempty('Access key is required'),
  secretKey: z.string().nonempty('Secret key is required'),
});


export type Config = z.infer<typeof schemaConfig>;
