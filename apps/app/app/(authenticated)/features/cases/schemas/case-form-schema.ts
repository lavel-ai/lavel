import { z } from 'zod';
import { InsertCaseSchema } from '@repo/database/src/tenant-app/schema';
import {
  caseTypeSchema,
  basicInfoSchema,
  authoritySchema,
  locationSchema,
  teamSchema,
  documentsSchema,
  eventsSchema,
  litigationSchema,
} from './tab-schemas';

// Extend the base case schema with form-specific validations
export const caseFormSchema = InsertCaseSchema
  .merge(caseTypeSchema)
  .merge(basicInfoSchema)
  .merge(authoritySchema)
  .merge(locationSchema)
  .merge(teamSchema)
  .merge(documentsSchema)
  .merge(eventsSchema)
  .merge(litigationSchema.partial()); // Litigation fields are optional by default

export type CaseFormData = z.infer<typeof caseFormSchema>;

// Tab validation type
export interface TabValidation {
  hasError: boolean;
  isComplete: boolean;
  label: string;
}

// Form tabs state
export interface TabsState {
  caseType: TabValidation;
  basicInfo: TabValidation;
  authority: TabValidation;
  location: TabValidation;
  team: TabValidation;
  documents: TabValidation;
  events: TabValidation;
  litigation?: TabValidation;
}

// Validation result type
export interface ValidationResult {
  valid: boolean;
  error?: string;
  field?: string;
}
