import { z } from 'zod';
import { utils } from './utils';

type StringInput = string | null | undefined;

export const normalizeAddress = {
  /**
   * Normalizes a street name to title case (e.g., "main street" -> "Main Street").
   */
  street: (input: StringInput): string => utils.titleCase(input),

  /**
   * Normalizes a city name to title case (e.g., "new york" -> "New York").
   */
  city: (input: StringInput): string => utils.titleCase(input),

  /**
   * Normalizes a state code to uppercase (e.g., "ny" -> "NY").
   */
  state: (input: StringInput): string => utils.uppercase(input),

  /**
   * Normalizes a zip code, converting empty strings to null (e.g., "12345" -> "12345", " " -> null).
   */
  zipCode: (input: StringInput): string | null => utils.nullIfEmpty(input),

  /**
   * Normalizes a country name to title case (e.g., "mexico" -> "Mexico").
   */
  country: (input: StringInput): string => utils.titleCase(input),

  /**
   * Normalizes an address type to lowercase (e.g., "Principal" -> "principal").
   */
  addressType: (input: StringInput): string => utils.lowercase(input),
};

export const addressTransformers = {
  street: z.string().transform(normalizeAddress.street),
  city: z.string().transform(normalizeAddress.city),
  state: z.string().transform(normalizeAddress.state),
  zipCode: z.string().transform(normalizeAddress.zipCode),
  country: z.string().transform(normalizeAddress.country),
  addressType: z.enum(['sucursal', 'fiscal', 'principal', 'otra']).optional().transform(normalizeAddress.addressType),
};

/**
 * Validation refinements specific to address fields.
 */
export const addressValidations = {
  zipCode: (val: string) => !val || /^\d{5}(-\d{4})?$/.test(val), // Basic US/MX zip code format
};