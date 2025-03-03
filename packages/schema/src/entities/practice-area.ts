// packages/schema/src/entities/practice-area.ts
import { z } from 'zod';
import { schemaRegistry } from '../registry';
import { normalizeText } from '../utils/normalize';

/**
 * Schema for practice area entity
 * Follows the forms guide architecture for validation and normalization
 */
export const practiceAreaSchema = z.object({
  name: z.string()
    .min(1, "El nombre del área de práctica es requerido")
    .max(255, "El nombre no puede exceder 255 caracteres")
    .transform((val) => normalizeText.titleCase(val)),
  
  description: z.string()
    .max(1000, "La descripción no puede exceder 1000 caracteres")
    .optional()
    .transform((val) => val ? normalizeText.trim(val) : val),
    
  active: z.boolean().default(true),

  // We don't include createdBy, updatedBy, createdAt, updatedAt, or deletedAt in the client-facing schema
  // as these will be handled by the server when saving to the database
});

// Optional fields for updates
export const practiceAreaUpdateSchema = practiceAreaSchema.partial();

/**
 * Normalization configuration for practice area
 * Defines how each field should be normalized
 */
export const practiceAreaNormalizationConfig = {
  name: {
    trim: true,
    titleCase: true,
    maxLength: 255,
  },
  description: {
    trim: true,
    sanitizeHtml: true,
    maxLength: 1000,
  },
  active: {
    type: 'boolean',
  },
};

// Register schema with more detailed configuration
schemaRegistry.register({
  name: 'practiceArea',
  version: '1.0.0',
  description: 'Schema for practice area entity',
  schema: practiceAreaSchema,
  config: practiceAreaNormalizationConfig,
  updateSchema: practiceAreaUpdateSchema,
});

export type PracticeAreaData = z.infer<typeof practiceAreaSchema>;
export type PracticeAreaUpdateData = z.infer<typeof practiceAreaUpdateSchema>;
