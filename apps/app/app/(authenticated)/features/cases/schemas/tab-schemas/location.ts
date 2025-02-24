import { z } from 'zod';

export const locationSchema = z.object({
  stateId: z.number({
    required_error: 'State is required',
  }),
  
  cityId: z.number({
    required_error: 'City is required',
  }),
});

export type LocationSchema = z.infer<typeof locationSchema>;
