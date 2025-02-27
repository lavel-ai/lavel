/**
 * Client Feature Schema Factory
 * 
 * This file extends the shared schemas with client feature-specific validations.
 */

import { z } from 'zod';

// Import shared schemas directly from their modules to avoid circular dependencies
import {
  addressSchema,
  addressesArraySchema,
  AddressFormData,
} from '@/shared/validation/schemas/address';

import {
  contactSchema,
  contactsArraySchema,
  ContactFormData,
} from '@/shared/validation/schemas/contact';

import {
  clientSchema,
  ClientFormData,
  billingSchema,
  BillingFormData, 
  ClientType,
  ClientCategory,
  ClientStatus,
  BillingCurrency as Currency,
  BillingTerms as PaymentTerms,
  createCompleteClientSchema,
} from '@/shared/validation/schemas/client';

import {
  corporationSchema,
  corporationsArraySchema,
  CorporationFormData,
} from '@/shared/validation/schemas/corporation';

// Re-export common schemas for use in the feature
export {
  // Address schemas
  addressSchema,
  addressesArraySchema,
  
  // Contact schemas
  contactSchema,
  contactsArraySchema,
  
  // Client schemas
  clientSchema,
  billingSchema,
  
  // Corporation schemas
  corporationSchema,
  corporationsArraySchema,
  
  // Common types
  ClientType,
  ClientCategory,
  ClientStatus,
  Currency,
  PaymentTerms,
};

export type {
  AddressFormData,
  ContactFormData,
  ClientFormData,
  BillingFormData,
  CorporationFormData,
};

// ============================================================================
// Complete Client Form Schema for Client Feature
// ============================================================================

/**
 * Fully assembled client schema with all relationships for the client feature
 */
export const clientFormSchema = createCompleteClientSchema({
  addressesSchema: addressesArraySchema,
  contactsSchema: z.array(contactSchema).optional().default([]), // Make contacts completely optional
  corporationsSchema: corporationsArraySchema,
});

export type CompletedClientFormData = z.infer<typeof clientFormSchema>;

// ============================================================================
// Default Form Values
// ============================================================================

/**
 * Default form values for the client feature
 */
export const defaultFormValues: Partial<CompletedClientFormData> = {
  clientType: 'fisica',
  legalName: '',
  category: 'otros',
  isConfidential: false,
  status: 'activo',
  preferredLanguage: 'es-MX',
  // Portal access fields removed temporarily
  leadLawyerId: '',
  billing: { 
    name: '', 
    rfc: '', 
    email: '', 
    billingTerms: 'Net 30', 
    billingCurrency: 'MXN' 
  },
  addresses: [{ 
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Mexico',
    addressType: 'oficina',
    isPrimary: true,
    isBilling: false,
    createdBy: '',
    updatedBy: '',
  }],
  contactInfo: [{ 
    contactName: '',
    email: '',
    primaryPhone: '',
    secondaryPhone: '',
    extension: '',
    department: '',
    role: '',
    isPrimary: true,
    createdBy: '',
    updatedBy: '',
    clientId: '',
  }],
  // Corporations are handled separately
};