/**
 * Shared Corporation Schema
 * 
 * This file provides corporation validation schemas that can be used across the application.
 */

import { z } from 'zod';
import { normalizeClient } from '@repo/database/src/tenant-app/utils/normalize/client';
import { normalizeAddress } from '@repo/database/src/tenant-app/utils/normalize/address';
import { validationMessages } from '../utils/schema-helpers';

// ============================================================================
// Corporation Schema
// ============================================================================

/**
 * Base corporation schema
 */
export const corporationSchema = z.object({
  name: z.string().min(1, "El nombre de la empresa es requerido").transform(normalizeClient.legalName),
  constitutionDate: z.string().min(1, "La fecha de constitución es requerida"),
  notaryNumber: z.number().nullable(),
  notaryState: z.string().optional().transform(val => val ? normalizeAddress.state(val) : ''),
  instrumentNumber: z.string().optional(),
  rfc: z.string().transform(normalizeClient.taxId),
  clientId: z.string().uuid().optional(),
  notes: z.string().optional(),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
}).refine(
  (data) => !data.rfc || /^[A-Z&Ñ]{3,4}[0-9]{6}[A-Z0-9]{3}$/.test(data.rfc),
  { message: "El formato del RFC es inválido", path: ["rfc"] }
);

export type CorporationFormData = z.infer<typeof corporationSchema>;

/**
 * Array of corporations
 */
export const corporationsArraySchema = z.array(corporationSchema);

/**
 * Optional corporation schema
 * We need to unwrap the schema before applying partial() since we have transforms and refinements
 */
export const optionalCorporationSchema = z.object({
  name: z.string().optional(),
  constitutionDate: z.string().optional(),
  notaryNumber: z.number().nullable().optional(),
  notaryState: z.string().optional(),
  instrumentNumber: z.string().optional(),
  rfc: z.string().optional(),
  clientId: z.string().uuid().optional(),
  notes: z.string().optional(),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
});

/**
 * Default empty values for form initialization
 */
export const defaultCorporationValues: Partial<CorporationFormData> = {
  name: '',
  rfc: '',
  constitutionDate: '',
  notaryNumber: null,
  notaryState: '',
  instrumentNumber: '',
  notes: '',
}; 