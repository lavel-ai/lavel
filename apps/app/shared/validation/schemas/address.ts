/**
 * Shared Address Schema
 * 
 * This file provides address validation schemas that can be used across the application.
 */

import { z } from 'zod';
import { addressSchema as dbAddressSchema } from '@repo/database/src/tenant-app/schema';
import { 
  normalizeAddress, 
  addressTransformers 
} from '@repo/database/src/tenant-app/utils/normalize/address';
import { validationMessages } from '../utils/schema-helpers';

// ============================================================================
// Shared Address Types
// ============================================================================

export const AddressType = z.enum(['oficina', 'casa', 'facturación', 'envío', 'sucursal', 'principal', 'bodega', 'otro']);
export type AddressType = z.infer<typeof AddressType>;

// ============================================================================
// Base Address Schema
// ============================================================================

/**
 * Creates a base address form schema with UI validations.
 */
export function createAddressSchema(options?: {
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
  const streetSchema = requiredFields
    ? z.string().min(1, messages.required).transform(normalizeAddress.street)
    : z.string().optional().transform(val => val ? normalizeAddress.street(val) : '');
    
  const citySchema = requiredFields
    ? z.string().min(1, messages.required).transform(normalizeAddress.city)
    : z.string().optional().transform(val => val ? normalizeAddress.city(val) : '');
    
  const stateSchema = requiredFields
    ? z.string().min(1, messages.required).transform(normalizeAddress.state)
    : z.string().optional().transform(val => val ? normalizeAddress.state(val) : '');
    
  const zipCodeSchema = requiredFields
    ? z.string().min(1, messages.required).transform(normalizeAddress.zipCode)
    : z.string().optional().transform(val => val ? normalizeAddress.zipCode(val) : '');
    
  const countrySchema = requiredFields
    ? z.string().min(1, messages.required).transform(normalizeAddress.country)
    : z.string().optional().transform(val => val ? normalizeAddress.country(val) : '');
  
  // Create the schema with appropriate validations
  return dbAddressSchema.extend({
    street: streetSchema,
    city: citySchema,
    state: stateSchema,
    zipCode: zipCodeSchema,
    country: countrySchema,
    addressType: addressTransformers.addressType.optional(),
    placeId: z.string().optional(),
    formattedAddress: z.string().optional(),
    latitude: z.string().optional(),
    longitude: z.string().optional(),
    isPrimary: z.boolean().default(false),
    isBilling: z.boolean().default(false),
  });
}

/**
 * Default address schema with required fields.
 */
export const addressSchema = createAddressSchema();
export type AddressFormData = z.infer<typeof addressSchema>;

/**
 * Optional address schema where fields aren't required.
 */
export const optionalAddressSchema = createAddressSchema({ requiredFields: false });

/**
 * Primary address schema that ensures required fields when marked as primary.
 */
export const primaryAddressSchema = addressSchema.refine(
  (data) => !data.isPrimary || (
    data.isPrimary && 
    !!data.street && 
    !!data.city && 
    !!data.state && 
    !!data.zipCode && 
    !!data.country
  ),
  { message: "La dirección principal debe tener todos los campos requeridos" }
);

/**
 * Billing address schema that ensures required fields when marked for billing.
 */
export const billingAddressSchema = addressSchema.refine(
  (data) => !data.isBilling || (
    data.isBilling && 
    !!data.street && 
    !!data.city && 
    !!data.state && 
    !!data.zipCode && 
    !!data.country
  ),
  { message: "La dirección de facturación debe tener todos los campos requeridos" }
);

// ============================================================================
// Common Address Arrays
// ============================================================================

/**
 * Array of addresses with at least one required.
 */
export const addressesArraySchema = z.array(addressSchema)
  .min(1, "Se requiere al menos una dirección")
  .refine(
    (addresses) => addresses.some((addr) => addr.isPrimary),
    "Una dirección debe ser marcada como principal"
  );

/**
 * Array of optional addresses.
 */
export const optionalAddressesArraySchema = z.array(optionalAddressSchema); 