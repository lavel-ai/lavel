// packages/schema/src/entities/department.ts
import { z } from 'zod';
import { schemaRegistry } from '../registry';
import { normalizeText } from '../utils/normalize';

export const departmentSchema = z.object({
  name: z.string()
    .min(1, "El nombre del are es requerido")
    .max(255, "El nombre no puede exceder 255 caracteres")
    .transform((val) => normalizeText.titleCase(val)),
  
  description: z.string()
    .optional()
    .transform((val) => val ? normalizeText.trim(val) : val),

  // We don't include createdBy, updatedBy, createdAt, updatedAt, or deletedAt in the client-facing schema
  // as these will be handled by the server when saving to the database
});

// Register schema
schemaRegistry.register({
  name: 'department',
  version: '1.0.0',
  description: 'Schema for department entity',
  schema: departmentSchema,
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
  },
});

export type DepartmentData = z.infer<typeof departmentSchema>;