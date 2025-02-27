/**
 * Schema Helper Utilities
 * 
 * This file contains utility functions for schema composition and transformation.
 */

import { z } from 'zod';

/**
 * Creates a UI form schema from a database schema by adding UI-specific validations.
 * 
 * @param baseSchema - The database schema to extend
 * @param uiExtensions - UI-specific field extensions with validations and error messages
 * @param refinements - Additional validation refinements for the entire schema
 * @returns A new Zod schema with combined database and UI validations
 */

export function createFormSchema <T extends z.ZodObject<any>,
  U extends Record<string, z.ZodTypeAny>
>(
  baseSchema: T,
  uiExtensions: U,
  refinements?: Array<[
    (data: z.infer<T> & { [K in keyof U]: z.infer<U[K]> }) => boolean,
    z.RefinementCtx | { message: string; path?: (string | number)[] }
  ]>
) {
  // Create extended schema - this returns ZodObject
  let schema = baseSchema.extend(uiExtensions);
  
  // Apply refinements if any
  if (refinements) {
    // Convert to type that can handle the ZodEffects return type
    let refinedSchema: z.ZodTypeAny = schema;
    
    refinements.forEach(([refineFn, refineArg]) => {
      refinedSchema = refinedSchema.refine(refineFn, refineArg);
    });
    
    return refinedSchema;
  }
  
  return schema;
}

/**
 * Transforms field values for UI display or database storage.
 * 
 * @param value - The value to transform
 * @param transformFn - The transformation function to apply
 * @returns The transformed value
 */
export function transformField<T, U>(
  value: T,
  transformFn: (val: T) => U
): U {
  return transformFn(value);
}

/**
 * Standard validation messages that can be reused across schemas.
 */
export const validationMessages = {
  required: 'Este campo es requerido',
  email: 'Debe ser un correo electrónico válido',
  phone: 'Debe ser un número de teléfono válido',
  min: (field: string, length: number) => `${field} debe tener al menos ${length} caracteres`,
  max: (field: string, length: number) => `${field} debe tener máximo ${length} caracteres`,
  format: (field: string) => `El formato de ${field} es inválido`,
};

/**
 * Standard refinement functions that can be reused across schemas.
 */
export const refinements = {
  /**
   * Validates that at least one item in an array has a specific property set to true.
   */
  hasOneWithPropertyTrue: <T extends { [key: string]: any }>(
    property: keyof T,
    message: string,
  ): [
    (data: T[]) => boolean,
    { message: string; path?: (string | number)[] },
  ] => [
    (data) => data.some((item) => item[property] === true),
    { message },
  ],

  /**
   * Validates a conditional field is present when a condition is true.
   */
  conditionalField: <T extends { [key: string]: any }>(
    condition: keyof T,
    field: keyof T,
    message: string,
  ): [
    (data: T) => boolean,
    { message: string; path?: (string | number)[] },
  ] => [
    (data) => !data[condition] || (data[condition] && !!data[field]),
    { message, path: [field as string] },
  ],
}; 