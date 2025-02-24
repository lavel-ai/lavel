import { z } from 'zod';

export const caseTypeSchema = z.object({
  type: z.enum(['advisory', 'litigation'], {
    required_error: 'Please select a case type',
  }),
  description: z.string().optional(),
});

export type CaseTypeSchema = z.infer<typeof caseTypeSchema>;
