import { z } from 'zod';

export const litigationSchema = z.object({
  filingNumber: z.string().optional(),
  
  filingDate: z.date().optional(),
  
  admissionDate: z.date().optional(),
  
  serviceDate: z.date().optional(),
  
  firstHearingDate: z.date().optional(),
  
  nextHearingDate: z.date().optional(),
  
  proceedingType: z.string({
    required_error: 'Proceeding type is required',
  }),
  
  currentStage: z.string({
    required_error: 'Current stage is required',
  }),
  
  claimAmount: z.number().optional(),
  
  dateOfCalculation: z.date().optional(),
  
  specialInstructions: z.string().optional(),
  
  requiredDocuments: z.string().optional(),
});

export type LitigationSchema = z.infer<typeof litigationSchema>;
