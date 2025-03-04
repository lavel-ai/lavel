// packages/schema/src/entities/practice-area.ts
import { z } from 'zod';
import { schemaRegistry } from '../registry';

// Define the practice area schema
export const practiceAreaSchema = z.object({
  name: z.string().min(1, "El nombre del área de práctica es requerido"),
  description: z.string().optional(),
  active: z.boolean().default(true),
});

// Register with the schema registry
schemaRegistry.registerEntitySchema({
  name: 'practiceArea',
  version: '1.0.0',
  description: 'Schema for practice area entity',
  schema: practiceAreaSchema,
  config: {
    name: { trim: true, titleCase: true },
    description: { trim: true },
  }
});

export type PracticeArea = z.infer<typeof practiceAreaSchema>;