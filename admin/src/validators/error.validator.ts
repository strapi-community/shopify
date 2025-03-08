import { z } from 'zod';

export const APIErrorSchema = z.object({
  message: z.string(),
  name: z.string(),
  response: z.object({
    data: z.object({
      error: z.object({
        status: z.number(),
        name: z.string(),
        message: z.string(),
        details: z.object({
          issues: z.array(
            z.object({
              code: z.string(),
              message: z.string(),
              path: z.array(z.string()),
            })
          ),
        }),
      }).partial(),
    }).partial(),
  }).partial(),
  code: z.number().optional(),
  status: z.number().optional(),
});
