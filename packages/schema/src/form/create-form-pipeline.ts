// packages/schema/src/form/create-form-pipeline.ts
import { z } from 'zod';
import { schemaRegistry } from '../registry';
import { TransformationPipeline } from '../pipeline';
import { ResilientNormalizer } from '../resilience/error-handler';
import { monitorDataQuality } from '../monitoring';
import { normalizeText } from '../utils/normalize';
import { sanitizeHtml } from '../utils/sanitize';

export type PipelineContext = {
  userId: string;
  tenantId?: string;
  source: string;
  operation?: string;
  startTime?: number;
  [key: string]: any;
};

export type ProcessResult<T> = {
  result: T;
  changes: Array<{
    field: string;
    original: any;
    normalized: any;
  }>;
  metadata: {
    processingTimeMs: number;
    source: string;
    userId: string;
    tenantId?: string;
    timestamp: string;
  };
  errors?: string[];
  fieldErrors?: Record<string, string>;
};

export function createFormPipeline<T>(options: {
  schemaKey: string;
  version?: string;
  customNormalizers?: Record<string, (value: any) => any>;
  resilienceStrategy?: 'use-partial' | 'use-default' | 'use-original' | 'reject';
  defaultValues?: Partial<T>;
}) {
  const { schemaKey, version = 'latest', resilienceStrategy = 'use-partial', defaultValues = {} } = options;
  
  // Get schema from registry
  const schemaInfo = schemaRegistry.get(schemaKey, version);
  if (!schemaInfo) {
    throw new Error(`Schema not found for entity: ${schemaKey} (version: ${version})`);
  }
  
  const schema = schemaInfo.schema as z.ZodSchema<T>;
  const schemaConfig = schemaInfo.config || {};

  // Create standardized sanitization function
  const sanitizeData = (data: any) => {
    const sanitized = { ...data };
    
    // Apply standard sanitization based on schema config
    Object.entries(schemaConfig).forEach(([field, config]) => {
      if (typeof sanitized[field] === 'string') {
        // Apply trimming
        if (config.trim) {
          sanitized[field] = sanitized[field].trim();
        }
        
        // Apply HTML sanitization
        if (config.sanitizeHtml) {
          sanitized[field] = sanitizeHtml(sanitized[field]);
        }
      }
    });
    
    return sanitized;
  };

  // Create standardized normalization function
  const normalizeData = (data: any) => {
    const normalized = { ...data };
    const changes: Array<{field: string; original: any; normalized: any}> = [];
    
    // Apply standard normalization based on schema config
    Object.entries(schemaConfig).forEach(([field, config]) => {
      if (typeof normalized[field] === 'string') {
        const original = normalized[field];
        
        // Apply title case
        if (config.titleCase) {
          normalized[field] = normalizeText.titleCase(normalized[field]);
        }
        
        // Apply lowercase
        if (config.lowercase) {
          normalized[field] = normalizeText.lowercase(normalized[field]);
        }
        
        // Apply uppercase
        if (config.uppercase) {
          normalized[field] = normalizeText.uppercase(normalized[field]);
        }
        
        // Apply custom normalizer if provided
        if (options.customNormalizers && options.customNormalizers[field]) {
          normalized[field] = options.customNormalizers[field](normalized[field]);
        }
        
        // Track changes
        if (original !== normalized[field]) {
          changes.push({
            field,
            original,
            normalized: normalized[field]
          });
        }
      }
    });
    
    return { result: normalized, metadata: { changes } };
  };

  // Create standardized validation function with resilience
  const validateData = async (data: any, context: any) => {
    const resilientValidator = new ResilientNormalizer({
      strategy: resilienceStrategy,
      defaultValues: defaultValues as Record<string, any>,
      logErrors: true,
    });
    
    const validationResult = await resilientValidator.normalize(schema, data, context);
    
    // Handle validation failures
    if (!validationResult.success) {
      console.warn(`[Validation] Validation errors for ${schemaKey}:`, validationResult.errors);
    }
    
    return validationResult.result;
  };

  // Create monitoring function
  const monitorData = (data: any) => {
    return monitorDataQuality(schemaKey, data);
  };

  // Create pipeline
  const pipeline = new TransformationPipeline(schemaKey, [
    { name: 'sanitize', transform: sanitizeData },
    { name: 'normalize', transform: normalizeData },
    { name: 'validate', transform: validateData },
    { name: 'monitor', transform: monitorData },
  ]);

  // Create process function
  const processData = async (data: any, context: PipelineContext): Promise<ProcessResult<T>> => {
    const startTime = context.startTime || performance.now();
    
    try {
      // Process through pipeline
      const result = await pipeline.process(data, {
        ...context,
        startTime,
      });
      
      // Extract changes from normalization stage
      const changes = result.changes
        .filter(change => change.stage === 'normalize')
        .map(change => ({
          field: change.field,
          original: change.originalValue,
          normalized: change.newValue
        }));
      
      // Return structured result
      return {
        result: result.result as T,
        changes,
        metadata: {
          processingTimeMs: performance.now() - startTime,
          source: context.source,
          userId: context.userId,
          tenantId: context.tenantId,
          timestamp: new Date().toISOString(),
        }
      };
    } catch (error) {
      // Handle errors
      if (error instanceof z.ZodError) {
        // Format Zod validation errors
        const fieldErrors: Record<string, string> = {};
        const errorMessages: string[] = [];
        
        error.errors.forEach(err => {
          const field = err.path.join('.');
          const message = err.message;
          fieldErrors[field] = message;
          errorMessages.push(`${field}: ${message}`);
        });
        
        return {
          result: data as T,
          changes: [],
          errors: errorMessages,
          fieldErrors,
          metadata: {
            processingTimeMs: performance.now() - startTime,
            source: context.source,
            userId: context.userId,
            tenantId: context.tenantId,
            timestamp: new Date().toISOString(),
          }
        };
      }
      
      // Re-throw other errors
      throw error;
    }
  };

  return {
    pipeline,
    processData
  };
}