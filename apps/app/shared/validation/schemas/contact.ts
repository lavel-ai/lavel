/**
 * Shared Contact Schema
 * 
 * This file provides contact validation schemas that can be used across the application.
 */

import { z } from 'zod';
import { contactSchema as dbContactSchema } from '@repo/database/src/tenant-app/schema';
import { 
  normalizeContact, 
  contactTransformers 
} from '@repo/database/src/tenant-app/utils/normalize/contact';
import { validationMessages } from '../utils/schema-helpers';

// ============================================================================
// Shared Contact Types
// ============================================================================

export const ContactType = z.enum(['personal', 'business', 'legal', 'emergency', 'other']);
export type ContactType = z.infer<typeof ContactType>;

export const PreferredContactMethod = z.enum(['telefono', 'email', 'whatsapp', 'celular', 'cualquiera']);
export type PreferredContactMethod = z.infer<typeof PreferredContactMethod>;

// ============================================================================
// Base Contact Schema
// ============================================================================

/**
 * Creates a base contact form schema with UI validations.
 */
export function createContactSchema(options?: {
  requiredFields?: boolean;
  customMessages?: Record<string, string>;
}) {
  const { requiredFields = true, customMessages = {} } = options || {};
  
  // Combine default and custom validation messages
  const messages = {
    ...validationMessages,
    ...customMessages,
  };
  
  // Determine field validation based on whether fields are required
  const contactNameSchema = requiredFields
    ? z.string().min(1, messages.required).transform(normalizeContact.contactName)
    : z.string().optional().transform(val => val ? normalizeContact.contactName(val) : '');
    
  const phoneSchema = requiredFields
    ? z.string().min(1, messages.required).transform(normalizeContact.phone)
    : z.string().optional().transform(val => val ? normalizeContact.phone(val) : '');
    
  const emailSchema = requiredFields
    ? z.string().min(1, messages.required).email(messages.email).transform(normalizeContact.email)
    : z.string().optional().transform(val => val ? normalizeContact.email(val) : '');
  
  // Create the schema with appropriate validations
  return dbContactSchema.extend({
    contactName: contactNameSchema,
    email: emailSchema,
    primaryPhone: phoneSchema,
    secondaryPhone: z.string().optional().transform(val => val ? normalizeContact.phone(val) : ''),
    extension: z.string().optional().transform(val => val ? val.trim() : ''),
    role: z.string().optional().transform(val => val ? normalizeContact.role(val) : ''),
    preferredContactMethod: PreferredContactMethod.default('cualquiera'),
    contactType: ContactType.optional(),
    isPrimary: z.boolean().default(false),
  });
}

/**
 * Default contact schema with required fields.
 */
export const contactSchema = createContactSchema();
export type ContactFormData = z.infer<typeof contactSchema>;

/**
 * Optional contact schema where fields aren't required.
 */
export const optionalContactSchema = createContactSchema({ requiredFields: false });

/**
 * Primary contact schema that ensures required fields when marked as primary.
 */
export const primaryContactSchema = contactSchema.refine(
  (data) => !data.isPrimary || (
    data.isPrimary && 
    !!data.contactName
  ),
  { message: "El contacto principal debe tener al menos un nombre" }
);

// ============================================================================
// Common Contact Arrays
// ============================================================================

/**
 * Array of contacts with no minimum requirement.
 * This allows forms to have zero contacts if desired.
 */
export const contactsArraySchema = z.array(contactSchema);

/**
 * Array of optional contacts.
 */
export const optionalContactsArraySchema = z.array(optionalContactSchema);