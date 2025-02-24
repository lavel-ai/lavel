import { z } from 'zod';

export const basicInfoSchema = z.object({
  title: z.string({
    required_error: 'Title is required',
  }).min(1, 'Title is required'),
  
  riskLevel: z.enum(['low', 'medium', 'high'], {
    required_error: 'Risk level is required',
  }),
  
  status: z.enum(['pending', 'active', 'closed', 'archived', 'other'], {
    required_error: 'Status is required',
  }),
  
  startDate: z.date({
    required_error: 'Start date is required',
  }),
  
  estimatedEndDate: z.date().optional(),
  
  caseLawBranchId: z.number({
    required_error: 'Law branch is required',
  }),
});

export type BasicInfoSchema = z.infer<typeof basicInfoSchema>;
