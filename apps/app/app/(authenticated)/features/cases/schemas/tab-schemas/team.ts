import { z } from 'zod';

export const teamSchema = z.object({
  leadAttorneyId: z.string({
    required_error: 'Lead attorney is required',
  }).uuid(),
  
  assignedTeamId: z.string({
    required_error: 'Team is required',
  }).uuid(),
  
  specialInstructions: z.string().optional(),
});

export type TeamSchema = z.infer<typeof teamSchema>;
