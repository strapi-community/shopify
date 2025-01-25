import { z } from 'zod';

export const schemaConfig = z.object({
  host: z.string().url().nonempty(),
});
