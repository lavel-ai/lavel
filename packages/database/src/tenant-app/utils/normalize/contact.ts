import { z } from 'zod';
import { utils } from './utils';

type StringInput = string | null | undefined;

export const normalizeContact = {
  /**
   * Normalizes a contact name to title case (e.g., "john doe" -> "John Doe").
   */
  contactName: (input: StringInput): string => utils.titleCase(input),

  /**
   * Normalizes an email to lowercase (e.g., "John.Doe@Example.com" -> "john.doe@example.com").
   * Returns null if invalid or empty.
   */
  email: (input: StringInput): string | null => {
    const val = utils.lowercase(input);
    return val && /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(val) ? val : null;
  },

  /**
   * Normalizes a phone number to digits with an optional "+" (e.g., "(123) 456-7890" -> "+1234567890").
   */
  phone: (input: StringInput): string => utils.phone(input),

  /**
   * Normalizes a department name to title case (e.g., "legal dept" -> "Legal Dept").
   * Returns null if empty.
   */
  department: (input: StringInput): string | null => {
    const val = utils.titleCase(input);
    return val === '' ? null : val;
  },

  /**
   * Normalizes a role name to title case (e.g., "legal dept" -> "Legal Dept").
   * Returns null if empty.
   */
  role: (input: StringInput): string | null => {
    const val = utils.titleCase(input);
    return val === '' ? null : val;
  },
};

export const contactTransformers = {
  contactName: z.string().transform(normalizeContact.contactName),
  email: z.string().transform(normalizeContact.email).nullable(),
  primaryPhone: z.string().transform(normalizeContact.phone),
  secondaryPhone: z.string().transform(normalizeContact.phone),
  department: z.string().optional().transform(normalizeContact.department),
  role: z.string().optional().transform(normalizeContact.role),
  extension: z.string().optional(),
};

/**
 * Validation refinements specific to contact fields.
 */
export const contactValidations = {
  email: (val: string) => !val || /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(val),
  phone: (val: string) => !val || /^\+?\d{10,15}$/.test(val),
  department: (val: string) => !val || /^[A-Z&Ñ]{3,4}[0-9]{6}[A-Z0-9]{3}$/.test(val),
  role: (val: string) => !val || /^[A-Z&Ñ]{3,4}[0-9]{6}[A-Z0-9]{3}$/.test(val),
};