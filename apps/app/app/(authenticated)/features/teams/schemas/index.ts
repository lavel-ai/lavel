// apps/app/app/(authenticated)/features/teams/schemas/index.ts
import { z } from 'zod';

// Define the team member schema
export const teamMemberSchema = z.object({
  userId: z.string(),
  role: z.enum(['member', 'leader'])
});

// Define the main team schema
export const createTeamSchema = z.object({
  name: z.string()
    .min(1, 'Team name is required')
    .max(255, 'Team name must be less than 255 characters')
    .transform(val => val.trim()),
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional()
    .transform(val => val?.trim()),
  practiceArea: z.string()
    .min(1, 'Practice area is required')
    .max(255, 'Practice area must be less than 255 characters')
    .transform(val => val.trim()),
  department: z.string()
    .min(1, 'Department is required')
    .max(255, 'Department must be less than 255 characters')
    .transform(val => val.trim()),
  teamMembers: z.array(teamMemberSchema)
    .min(1, 'At least one team member is required'),
});

// Export type for use in components and actions
export type CreateTeamFormData = z.infer<typeof createTeamSchema>;

// Validation function that can be used both client and server side
export const validateTeamData = (data: unknown) => {
  return createTeamSchema.safeParse(data);
};