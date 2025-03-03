// Similar to practice-area-pipeline.ts
import { createTransformPipeline } from './index';
import { departmentSchema } from '../entities/department';
import { normalizeText } from '../utils/normalize';
import { monitorDataQuality } from '../monitoring';
import { sanitizeHtml } from '../utils/sanitize';
import { ZodError } from 'zod';
import { trackErrorEvent } from '@repo/analytics/posthog/actions/server-actions';

// Define the structure for the metadata
interface PipelineContext {
  userId: string;
  tenantId?: string;
  source: string;
  operation?: string;
  entityId?: string;
  startTime?: number;
  [key: string]: any;
}

// Define the structure for the result
interface ProcessDepartmentResult {
  result: Record<string, any>;
  changes: Array<{
    field: string;
    original: string;
    normalized: string;
  }>;
  errors?: string[];
  fieldErrors?: Record<string, string>;
  metadata: {
    processingTimeMs: number;
    source: string;
    userId: string;
    tenantId?: string;
    operation?: string;
    timestamp: string;
    stageMetrics?: Record<string, number>;
  };
}

// Sanitization stage
function sanitizeDepartmentData(data: any) {
  const sanitized = { ...data };
  
  if (typeof sanitized.name === 'string') {
    sanitized.name = sanitized.name.trim();
  }
  
  if (typeof sanitized.description === 'string') {
    sanitized.description = sanitizeHtml(sanitized.description.trim());
  }
  
  return sanitized;
}

// Normalization stage
function normalizeDepartmentData(data: any) {
  const normalized = { ...data };
  const changes: Array<{field: string; original: string; normalized: string}> = [];
  
  if (typeof normalized.name === 'string') {
    const originalName = normalized.name;
    normalized.name = normalizeText.titleCase(normalized.name);
    
    // Track the change if normalization modified the value
    if (originalName !== normalized.name) {
      changes.push({
        field: 'name',
        original: originalName,
        normalized: normalized.name
      });
    }
  }
  
  // Return both the normalized data and a record of changes
  return {
    result: normalized,
    metadata: { changes }
  };
}

// Validation stage
async function validateDepartmentData(data: any) {
  try {
    const validated = await departmentSchema.parseAsync(data);
    return validated;
  } catch (error) {
    if (error instanceof ZodError) {
      // Convert Zod errors to a more structured format
      const fieldErrors: Record<string, string> = {};
      const errorMessages: string[] = [];
      
      error.errors.forEach(err => {
        const field = err.path.join('.');
        const message = err.message;
        fieldErrors[field] = message;
        errorMessages.push(`${field}: ${message}`);
      });
      
      // Throw a structured error object
      throw {
        name: 'ValidationError',
        message: 'Validation failed',
        fieldErrors,
        errors: errorMessages,
        zodError: error
      };
    }
    
    // Re-throw other errors
    throw error;
  }
}

// Create pipeline
export const departmentPipeline = createTransformPipeline({
  name: 'department',
  stages: [
    {
      name: 'sanitize',
      transform: sanitizeDepartmentData,
    },
    {
      name: 'normalize',
      transform: normalizeDepartmentData,
    },
    {
      name: 'validate',
      transform: validateDepartmentData,
    },
    {
      name: 'monitor',
      transform: (data, context) => monitorDataQuality('department', data),
    },
  ],
});

// Export wrapper function
export async function processDepartmentData(
  data: any, 
  context: PipelineContext
): Promise<ProcessDepartmentResult> {
  const startTime = context.startTime || performance.now();
  const stageMetrics: Record<string, number> = {};
  
  try {
    const result = await departmentPipeline.process(data, {
      ...context,
      startTime,
      captureStageMetrics: (stage: string, timeMs: number) => {
        stageMetrics[stage] = timeMs;
      }
    });
    
    // Extract changes from the normalization stage
    const changes = result.metadata?.changes || [];
    
    return {
      result: result.data,
      changes,
      metadata: {
        processingTimeMs: performance.now() - startTime,
        source: context.source,
        userId: context.userId,
        tenantId: context.tenantId,
        operation: context.operation,
        timestamp: new Date().toISOString(),
        stageMetrics
      }
    };
  } catch (error) {
    // Handle validation errors specially
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ValidationError') {
      return {
        result: data,
        changes: [],
        errors: error.errors,
        fieldErrors: error.fieldErrors,
        metadata: {
          processingTimeMs: performance.now() - startTime,
          source: context.source,
          userId: context.userId,
          tenantId: context.tenantId,
          operation: context.operation,
          timestamp: new Date().toISOString(),
          stageMetrics
        }
      };
    }
    
    // Track other errors
    await trackErrorEvent(error, {
      context: 'processDepartmentData',
      userId: context.userId,
      tenantId: context.tenantId,
      source: context.source,
      additionalData: { 
        data, 
        operation: context.operation 
      },
      severity: 'medium'
    });
    
    console.error('Error processing department data:', {
      error,
      source: context.source,
      operation: context.operation,
      userId: context.userId,
      tenantId: context.tenantId
    });
    
    throw error;
  }
}