// packages/schema/src/entities/practice-area.ts
import { z } from 'zod';
import { schemaRegistry } from '../registry';
import { normalizeText } from '../utils/normalize';

export const practiceAreaSchema = z.object({
  name: z.string()
    .min(1, "El nombre del área de práctica es requerido")
    .max(255, "El nombre no puede exceder 255 caracteres")
    .transform((val) => normalizeText.titleCase(val)),
  
  description: z.string()
    .optional()
    .transform((val) => val ? normalizeText.trim(val) : val),
    
  active: z.boolean().default(true),

  // We don't include createdBy, updatedBy, createdAt, updatedAt, or deletedAt in the client-facing schema
  // as these will be handled by the server when saving to the database
});

// Register schema
schemaRegistry.register({
  name: 'practiceArea',
  version: '1.0.0',
  description: 'Schema for practice area entity',
  schema: practiceAreaSchema,
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

export type PracticeAreaData = z.infer<typeof practiceAreaSchema>;
