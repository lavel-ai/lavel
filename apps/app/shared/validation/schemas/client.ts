/**
 * Shared Client Schema
 * 
 * This file provides client validation schemas that can be used across the application.
 */

import { z } from 'zod';
import { clientInsertSchema } from '@repo/database/src/tenant-app/schema';
import { 
  normalizeClient, 
  clientTransformers 
} from '@repo/database/src/tenant-app/utils/normalize/client';
import { validationMessages } from '../utils/schema-helpers';

// ============================================================================
// Shared Client Types
// ============================================================================

export const ClientType = z.enum(['fisica', 'moral']);
export type ClientType = z.infer<typeof ClientType>;

export const ClientCategory = z.enum(['litigio', 'consultoria', 'corporativo', 'otros']);
export type ClientCategory = z.infer<typeof ClientCategory>;

export const ClientStatus = z.enum(['prospecto', 'activo', 'inactivo', 'archivado', 'borrador']);
export type ClientStatus = z.infer<typeof ClientStatus>;

export const BillingCurrency = z.enum(['MXN', 'USD', 'EUR', 'CAD']);
export type BillingCurrency = z.infer<typeof BillingCurrency>;

export const BillingTerms = z.enum(['Net 15', 'Net 30', 'Net 45', 'Net 60', 'Hora', 'Iguala']);
export type BillingTerms = z.infer<typeof BillingTerms>;

// ============================================================================
// Base Client Schema
// ============================================================================

/**
 * Creates a base client form schema with UI validations.
 */
export function createClientSchema(options?: {
  requiredFields?: boolean;
  customMessages?: Record<string, string>;
}) {
  const { requiredFields = false, customMessages = {} } = options || {};
  
  // Combine default and custom validation messages
  const messages = {
    ...validationMessages,
    ...customMessages,
  };
  
  // Determine field validation based on whether fields are required
  const legalNameSchema = requiredFields
    ? z.string().min(1, messages.required).transform(normalizeClient.legalName)
    : z.string().optional().transform(val => val ? normalizeClient.legalName(val) : '');
    
  const taxIdSchema = z.string().max(13, "El RFC debe tener 13 caracteres o menos").optional()
    .transform(val => val ? normalizeClient.taxId(val) : '');
  
  // Create the schema with appropriate validations
  return clientInsertSchema.extend({
    clientType: ClientType,
    legalName: legalNameSchema,
    taxId: taxIdSchema,
    category: ClientCategory.default('otros'),
    isConfidential: z.boolean().default(false),
    status: ClientStatus.default('activo'),
    preferredLanguage: clientTransformers.preferredLanguage.default('es-MX'),
    portalAccess: z.boolean().default(false).optional(),
    portalAccessEmail: clientTransformers.portalAccessEmail.optional(),
    billingName: z.string().optional(),
    billingEmail: z.string().optional(),
    billingRfc: z.string().optional(),
    billingTerms: z.string().optional(),
    billingCurrency: z.string().default('MXN'),
    notes: z.string().optional().transform(val => val?.trim()),
  });
}

/**
 * Default client schema with required fields.
 */
export const clientSchema = createClientSchema();
export type ClientFormData = z.infer<typeof clientSchema>;

/**
 * Optional client schema where fields aren't required.
 */
export const optionalClientSchema = createClientSchema({ requiredFields: false });

/**
 * Billing information schema for clients
 */
export const billingSchema = z.object({
  name: z.string().min(1, "El nombre del cliente es requerido").transform(normalizeClient.legalName),
  rfc: z.string().transform(normalizeClient.taxId),
  billingTerms: BillingTerms.optional(),
  billingCurrency: BillingCurrency.default('MXN'),
  email: z.string().email("Debe ser un correo electrónico válido").transform(normalizeClient.email),
});
export type BillingFormData = z.infer<typeof billingSchema>;

// ============================================================================
// Client with Relationships
// ============================================================================

/**
 * Creates a complete client schema including address and contact relationships
 */
export function createCompleteClientSchema(options: {
  addressesSchema: z.ZodType<any>;
  contactsSchema: z.ZodType<any>;
  corporationsSchema: z.ZodType<any>;
}) {
  const { addressesSchema, contactsSchema, corporationsSchema } = options;
  
  return clientSchema
    .extend({
      // Add related entities
      addresses: addressesSchema.optional(),
      contactInfo: contactsSchema.optional(),
      corporations: corporationsSchema.optional(),
      
      // Add billing information
      billing: billingSchema.optional(),
    })
    .superRefine((data, ctx) => {
      // Only validate legalName as required
      if (!data.legalName || data.legalName.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El nombre legal es requerido",
          path: ["legalName"],
        });
      }
      
      // All other validations are optional
      return true;
    });
}

/**
 * Default empty values for form initialization
 */
export const defaultClientValues: Partial<ClientFormData> = {
  clientType: 'fisica',
  legalName: '',
  taxId: '',
  category: 'otros',
  isConfidential: false,
  status: 'activo',
  preferredLanguage: 'es-MX',
  portalAccess: false,
}; 