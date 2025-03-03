// packages/schema/src/pipeline/practice-area-pipeline.ts
import { createTransformPipeline } from './index';
import { practiceAreaSchema } from '../entities/practice-area';
import { normalizeText } from '../utils/normalize';
import { monitorDataQuality } from '../monitoring';
import { sanitizeHtml } from '../utils/sanitize';

// Sanitization stage - focus on removing potentially harmful content
function sanitizePracticeAreaData(data: any) {
  // Create a clean copy of the data
  const sanitized = { ...data };
  
  // Apply sanitization rules
  if (typeof sanitized.name === 'string') {
    sanitized.name = sanitized.name.trim();
  }
  
  if (typeof sanitized.description === 'string') {
    // Apply HTML sanitization to description
    sanitized.description = sanitizeHtml(sanitized.description.trim());
  }
  
  // Ensure active is a boolean
  sanitized.active = typeof sanitized.active === 'boolean' 
    ? sanitized.active 
    : sanitized.active === 'true' || sanitized.active === true;
  
  return sanitized;
}

// Normalization stage - focus on standardizing data format
function normalizePracticeAreaData(data: any) {
  // Create a normalized copy of the data
  const normalized = { ...data };
  
  // Apply normalization rules
  if (typeof normalized.name === 'string') {
    normalized.name = normalizeText.titleCase(normalized.name);
  }
  
  return normalized;
}

// Validation stage - verify data meets requirements
async function validatePracticeAreaData(data: any) {
  try {
    // Parse and validate using Zod schema
    return await practiceAreaSchema.parseAsync(data);
  } catch (error) {
    console.error('Validation error in practice area data:', error);
    // Re-throw with more context
    throw error;
  }
}

// Create pipeline with clear separation of concerns
export const practiceAreaPipeline = createTransformPipeline({
  name: 'practiceArea',
  stages: [
    {
      name: 'sanitize',
      transform: sanitizePracticeAreaData,
    },
    {
      name: 'normalize',
      transform: normalizePracticeAreaData,
    },
    {
      name: 'validate',
      transform: validatePracticeAreaData,
    },
    {
      name: 'monitor',
      transform: (data, context) => {
        // Add quality monitoring
        const monitoredData = monitorDataQuality('practiceArea', data);
        
        // Log processing time if available
        if (context.startTime) {
          const processingTime = performance.now() - context.startTime;
          console.log(`Practice area data processing completed in ${processingTime.toFixed(2)}ms`);
        }
        
        return monitoredData;
      },
    },
  ],
});

// Export a function to process practice area data with improved context
export async function processPracticeAreaData(
  data: any, 
  context: { 
    userId: string; 
    source: string; 
    operation?: string;
    startTime?: number;
    tenantId?: string;
  }
) {
  // Calculate start time if not provided
  const startTime = context.startTime || performance.now();
  
  // Process the data through the pipeline
  try {
    const result = await practiceAreaPipeline.process(data, {
      ...context,
      startTime,
    });
    
    // Add metadata about the processing
    return {
      ...result,
      metadata: {
        processingTimeMs: performance.now() - startTime,
        source: context.source,
        operation: context.operation,
        timestamp: new Date().toISOString(),
      }
    };
  } catch (error) {
    // Log the error with context
    console.error('Error processing practice area data:', {
      error,
      source: context.source,
      operation: context.operation,
      userId: context.userId,
    });
    
    // Re-throw the error to be handled by the caller
    throw error;
  }
}
