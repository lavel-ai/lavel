import { type ZodError } from "zod";

// ============================================================================
// Types
// ============================================================================

export type ValidationError = {
  path: string[];
  message: string;
};

export type ValidationResult = {
  success: boolean;
  errors?: ValidationError[];
};

// ============================================================================
// Error Formatting
// ============================================================================

/**
 * Formats a Zod validation error into a more user-friendly format
 */
export function formatZodError(error: ZodError): ValidationError[] {
  return error.errors.map((err) => ({
    path: err.path.map(String),
    message: err.message,
  }));
}

/**
 * Creates a validation error with the given field and message
 */
export function createValidationError(field: string, message: string): ValidationError {
  return {
    path: field.split("."),
    message,
  };
}

// ============================================================================
// Error Retrieval
// ============================================================================

/**
 * Gets the first error message for a specific field path
 */
export function getFieldError(errors: ValidationError[] | undefined, path: string): string | undefined {
  return errors?.find((err) => err.path.join(".") === path)?.message;
}

/**
 * Gets all error messages for a specific field path
 */
export function getFieldErrors(errors: ValidationError[] | undefined, path: string): string[] {
  return errors?.filter((err) => err.path.join(".") === path).map(err => err.message) ?? [];
}

/**
 * Checks if a section (tab) has any validation errors
 */
export function hasSectionErrors(errors: ValidationError[] | undefined, sectionPath: string): boolean {
  return errors?.some((err) => err.path[0] === sectionPath) ?? false;
}

/**
 * Gets all error messages for a specific section
 */
export function getSectionErrors(errors: ValidationError[] | undefined, sectionPath: string): string[] {
  return errors?.filter((err) => err.path[0] === sectionPath).map((err) => err.message) ?? [];
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validates if an array field has a primary item selected
 */
export function validatePrimarySelection<T extends { isPrimary?: boolean }>(
  items: T[],
  fieldName: string
): ValidationResult {
  const primaryItems = items.filter((item) => item.isPrimary);
  
  if (primaryItems.length === 0) {
    return {
      success: false,
      errors: [{
        path: [fieldName],
        message: `Please select a primary ${fieldName.toLowerCase()}`,
      }],
    };
  }

  if (primaryItems.length > 1) {
    return {
      success: false,
      errors: [{
        path: [fieldName],
        message: `Only one ${fieldName.toLowerCase()} can be primary`,
      }],
    };
  }

  return { success: true };
}

/**
 * Validates required fields in an object
 */
export function validateRequiredFields<T extends Record<string, any>>(
  data: T,
  requiredFields: (keyof T)[],
  sectionName: string
): ValidationResult {
  const errors: ValidationError[] = [];

  for (const field of requiredFields) {
    const value = data[field];
    if (value === undefined || value === null || value === "") {
      errors.push({
        path: [sectionName, String(field)],
        message: `${String(field)} is required`,
      });
    }
  }

  return {
    success: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Checks if a section is complete (all required fields filled)
 */
export function isSectionComplete<T extends Record<string, any>>(
  data: T,
  requiredFields: (keyof T)[]
): boolean {
  return requiredFields.every((field) => {
    const value = data[field];
    return value !== undefined && value !== null && value !== "";
  });
}

/**
 * Validates email format
 */
export function validateEmail(email: string): ValidationResult {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(email);

  return {
    success: isValid,
    errors: isValid ? undefined : [{
      path: ["email"],
      message: "Invalid email format",
    }],
  };
}

/**
 * Merges multiple validation results into one
 */
export function mergeValidationResults(...results: ValidationResult[]): ValidationResult {
  const success = results.every((result) => result.success);
  const errors = results.flatMap((result) => result.errors || []);

  return {
    success,
    errors: errors.length > 0 ? errors : undefined,
  };
}