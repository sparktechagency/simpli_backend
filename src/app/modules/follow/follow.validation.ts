import { z } from 'zod';

export const updateFollowData = z.object({
  body: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
  }),
});
