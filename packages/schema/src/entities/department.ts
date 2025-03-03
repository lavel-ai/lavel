import { z } from 'zod';

export const departmentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

export type Department = z.infer<typeof departmentSchema>;

// Optional fields for updates
export const departmentUpdateSchema = departmentSchema.partial();
