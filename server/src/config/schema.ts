import { z } from 'zod';

const memoryEngine = z.object({
  engine: z.literal('memory'),
});
export type MemoryEngine = z.infer<typeof memoryEngine>;
const redisEngine = z.object({
  engine: z.literal('redis'),
  connection: z.object({
    host: z.string().nonempty(),
    port: z.number().int().positive(),
    db: z.number().int().positive(),
    password: z.string().optional(),
    username: z.string().optional(),
  }),
});

export type RedisEngine = z.infer<typeof redisEngine>;

export const schemaConfig = z.intersection(
  z.object({
    host: z.string().url(),
    encryptionKey: z.string().min(32),
  }),
  z.discriminatedUnion('engine', [memoryEngine, redisEngine])
);

export type PluginConfig = z.infer<typeof schemaConfig>;
