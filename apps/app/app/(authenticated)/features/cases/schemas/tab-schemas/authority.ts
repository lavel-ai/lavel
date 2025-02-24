import { z } from 'zod';

export const authoritySchema = z.object({
  courthouseId: z.number({
    required_error: 'Authority/Courthouse is required',
  }),
  
  authorityType: z.enum(['court', 'administrative', 'other'], {
    required_error: 'Authority type is required',
  }),
  
  authorityDetails: z.string().optional(),
});

export type AuthoritySchema = z.infer<typeof authoritySchema>;
