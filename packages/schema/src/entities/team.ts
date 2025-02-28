// packages/schema/src/entities/team.ts
import { z } from 'zod';
import { schemaRegistry } from '../registry';
import { normalizeText } from '../utils/normalize';

// Define the team role schema
export const teamRoleSchema = z.enum(["leader", "member"], {
  errorMap: () => ({ message: "El rol debe ser 'leader' o 'member'" })
});

// Define the team member schema
export const teamMemberSchema = z.object({
  userId: z.string().uuid("ID de usuario inválido"),
  role: teamRoleSchema,
});

// Create team schema
export const teamSchema = z.object({
  name: z.string()
    .min(1, "El nombre del equipo es requerido")
    .max(255, "El nombre no puede exceder 255 caracteres")
    .transform((val) => normalizeText.titleCase(val)),
  
  description: z.string()
    .optional()
    .transform((val) => val ? normalizeText.trim(val) : val),
  
  practiceArea: z.string()
    .optional()
    .transform((val) => val ? normalizeText.titleCase(val) : val),
  
  department: z.string()
    .optional()
    .transform((val) => val ? normalizeText.titleCase(val) : val),
  
  members: z.array(teamMemberSchema)
    .min(1, "El equipo debe tener al menos un miembro"),
});

// Register schema
schemaRegistry.register({
  name: 'team',
  version: '1.0.0',
  description: 'Schema for team entity with members',
  schema: teamSchema,
  config: {
    name: {
      trim: true,
      titleCase: true,
      maxLength: 255,
    },
    description: {
      trim: true,
      sanitizeHtml: true,
    },
    practiceArea: {
      trim: true,
      titleCase: true,
    },
    department: {
      trim: true,
      titleCase: true, 
    },
  },
});

export type TeamData = z.infer<typeof teamSchema>;