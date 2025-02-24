import { z } from 'zod';
import { utils } from './utils';

type StringInput = string | null | undefined;

export const normalizeClient = {
  /**
   * Normalizes a legal name to title case (e.g., "john doe" -> "John Doe").
   */
  legalName: (input: StringInput): string => utils.titleCase(input),

  /**
   * Normalizes a tax ID (RFC) to uppercase, ensuring it matches the Mexican RFC format (e.g., "abc123456xyz" -> "ABC123456XYZ").
   * Returns empty string if invalid or empty.
   */
  taxId: (input: StringInput): string => {
    const val = utils.uppercase(input);
    return val && /^[A-Z&Ñ]{3,4}[0-9]{6}[A-Z0-9]{3}$/.test(val) ? val : '';
  },

  /**
   * Normalizes an email to lowercase (e.g., "John.Doe@Example.com" -> "john.doe@example.com").
   * Returns null if invalid or empty.
   */
  email: (input: StringInput): string | null => {
    const val = utils.lowercase(input);
    return val && /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(val) ? val : null;
  },

  /**
   * Normalizes a language code to lowercase (e.g., "ES-MX" -> "es-mx").
   */
  language: (input: StringInput): string => utils.lowercase(input || 'es-MX'),
};

export const clientTransformers = {
  legalName: z.string().transform(normalizeClient.legalName),
  taxId: z.string().transform(normalizeClient.taxId),
  portalAccessEmail: z.string().transform(normalizeClient.email).nullable(),
  preferredLanguage: z.string().transform(normalizeClient.language),
};

/**
 * Validation refinements specific to client fields.
 */
export const clientValidations = {
  taxId: (val: string) => !val || /^[A-Z&Ñ]{3,4}[0-9]{6}[A-Z0-9]{3}$/.test(val),
  email: (val: string) => !val || /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(val),
};