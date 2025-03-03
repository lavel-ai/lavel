import { captureException } from '@sentry/nextjs';
import { log } from './log';

/**
 * Error context for better error tracking
 */
export interface ErrorContext {
  /** Where the error occurred - typically function or component name */
  context: string;
  /** User ID who experienced the error */
  userId?: string;
  /** Tenant ID where the error occurred */
  tenantId?: string;
  /** Source of the error (web-form, api, etc.) */
  source?: string;
  /** Additional data relevant to debugging */
  additionalData?: Record<string, any>;
  /** Error severity level */
  severity?: 'low' | 'medium' | 'high' | 'critical';
  /** Tags for filtering and categorizing errors */
  tags?: string[];
}

/**
 * Parse an error and return a user-friendly error message
 * while also logging the error for debugging.
 */
export const parseError = (error: unknown): string => {
  let message = 'An error occurred';

  if (error instanceof Error) {
    message = error.message;
  } else if (error && typeof error === 'object' && 'message' in error) {
    message = error.message as string;
  } else {
    message = String(error);
  }

  try {
    captureException(error);
    log.error(`Parsing error: ${message}`);
  } catch (newError) {
    // biome-ignore lint/suspicious/noConsole: Need console here
    console.error('Error parsing error:', newError);
  }

  return message;
};

/**
 * Capture and track an error with additional context
 * @param error - The error to capture
 * @param context - Additional context for better error tracking
 * @returns The parsed error message for client display
 */
export const captureError = (error: unknown, contextData: ErrorContext): string => {
  let errorMessage = 'An error occurred';
  
  // Extract message from error
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (error && typeof error === 'object' && 'message' in error) {
    errorMessage = error.message as string;
  } else {
    errorMessage = String(error);
  }

  try {
    // Structure error data for logging
    const errorData = {
      message: errorMessage,
      timestamp: new Date().toISOString(),
      ...contextData,
    };
    
    // Capture in Sentry with structured context
    captureException(error, {
      tags: {
        context: contextData.context,
        userId: contextData.userId,
        tenantId: contextData.tenantId,
        source: contextData.source || 'unknown',
        severity: contextData.severity || 'medium',
        ...(contextData.tags ? contextData.tags.reduce((acc, tag) => ({ ...acc, [tag]: true }), {}) : {})
      },
      extra: {
        ...contextData.additionalData
      }
    });
    
    // Log structured error
    log.error('Error captured', errorData);
  } catch (loggingError) {
    // Fallback if capturing fails
    console.error('Failed to capture error:', loggingError);
    console.error('Original error:', error);
    console.error('Error context:', contextData);
  }
  
  return errorMessage;
};

/**
 * Create a field-specific error object for form validation errors
 * @param errors - Map of field names to error messages
 * @returns Object with error structure and field-specific errors
 */
export const createFieldErrors = (errors: Record<string, string>) => {
  return {
    hasErrors: Object.keys(errors).length > 0,
    fieldErrors: errors,
    message: Object.values(errors).join(', ')
  };
};

/**
 * Format and standardize various error types to a consistent structure
 * @param error - The error to format
 * @param defaultMessage - Default message if error can't be parsed
 * @returns Standardized error object
 */
export const formatError = (error: unknown, defaultMessage = 'An unexpected error occurred') => {
  // Already formatted error
  if (error && typeof error === 'object' && 'message' in error && 'code' in error) {
    return error;
  }
  
  let message = defaultMessage;
  let code = 'UNKNOWN_ERROR';
  let status = 500;
  
  if (error instanceof Error) {
    message = error.message;
    // Extract code if available
    if ('code' in error) {
      code = (error as any).code;
    }
  } else if (typeof error === 'string') {
    message = error;
  }
  
  return {
    message,
    code,
    status,
    timestamp: new Date().toISOString()
  };
};
