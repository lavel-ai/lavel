// packages/schema/src/resilience/error-handler.ts
import { z } from 'zod';

type ErrorRecoveryStrategy = 'use-default' | 'use-partial' | 'use-original' | 'reject';

export interface ResilienceOptions {
  strategy: ErrorRecoveryStrategy;
  defaultValues?: Record<string, any>;
  retryAttempts?: number;
  logErrors?: boolean;
}

export class ResilientNormalizer {
  constructor(private options: ResilienceOptions = { 
    strategy: 'reject',
    logErrors: true,
  }) {}

  async normalize<T>(
    schema: z.ZodSchema<T>,
    data: any,
    context: Record<string, any> = {}
  ): Promise<{ 
    result: Partial<T>; 
    success: boolean; 
    errors?: z.ZodError;
    usedFallback: boolean;
  }> {
    try {
      // Attempt to parse with the schema
      const result = schema.parse(data);
      return { result, success: true, usedFallback: false };
    } catch (error) {
      // Log the error if enabled
      if (this.options.logErrors && error instanceof Error) {
        console.error('Normalization error:', error.message, { data, context });
      }

      // Handle the error based on the strategy
      if (error instanceof z.ZodError) {
        return this.recoverFromError(error, schema, data);
      }

      // For non-zod errors, reject by default
      throw error;
    }
  }

  private recoverFromError<T>(
    error: z.ZodError, 
    schema: z.ZodSchema<T>, 
    data: any
  ): { 
    result: Partial<T>; 
    success: boolean; 
    errors: z.ZodError;
    usedFallback: boolean;
  } {
    switch (this.options.strategy) {
      case 'use-default':
        return {
          result: this.options.defaultValues as T,
          success: false,
          errors: error,
          usedFallback: true,
        };

      case 'use-partial':
        // Extract valid parts using a partial schema
        try {
          const partialSchema = schema.partial();
          const partialResult = partialSchema.parse(data);
          return {
            result: partialResult,
            success: false,
            errors: error,
            usedFallback: true,
          };
        } catch (partialError) {
          // If even partial fails, fall back to defaults or original
          return this.recoverFromError(
            error, 
            schema, 
            data
          );
        }

      case 'use-original':
        return {
          result: data,
          success: false,
          errors: error,
          usedFallback: true,
        };

      case 'reject':
      default:
        // Re-throw the error
        throw error;
    }
  }
}

// Apply to our team pipeline
export function createResilientTeamPipeline() {
  const resilientNormalizer = new ResilientNormalizer({
    strategy: 'use-partial',
    defaultValues: {
      name: 'Untitled Team',
      members: [],
    },
    logErrors: true,
  });

  return {
    async normalize(data: any) {
      return resilientNormalizer.normalize(teamSchema, data);
    }
  };
}