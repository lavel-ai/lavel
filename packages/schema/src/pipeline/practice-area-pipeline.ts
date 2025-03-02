// packages/schema/src/pipeline/practice-area-pipeline.ts
import { createTransformPipeline } from './index';
import { practiceAreaSchema } from '../entities/practice-area';
import { normalizeText } from '../utils/normalize';
import { monitorDataQuality } from '../monitoring';
import { ResilientNormalizer } from '../resilience/error-handler';

// Sanitization stage
function sanitizePracticeAreaData(data: any) {
  return {
    ...data,
    name: data.name?.trim() ?? '',
    description: data.description?.trim() ?? '',
    active: typeof data.active === 'boolean' ? data.active : true,
  };
}

// Normalization stage
function normalizePracticeAreaData(data: any) {
  return {
    ...data,
    name: normalizeText.titleCase(data.name),
  };
}

// Create pipeline
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
      transform: async (data, context) => {
        const resilientValidator = new ResilientNormalizer({ strategy: 'use-partial' });
        const validationResult = await resilientValidator.normalize(practiceAreaSchema, data, context);
        if (!validationResult.success) {
          console.warn("[Validation Stage] Validation errors, using partial data:", validationResult.errors);
        }
        return validationResult.result;
      },
    },
    {
      name: 'monitor',
      transform: (data) => monitorDataQuality('practiceArea', data),
    },
  ],
});

// Export a function to process practice area data
export async function processPracticeAreaData(
  data: any, 
  context: { 
    userId: string; 
    source: string; 
    operation?: string;   // Make operation optional
    startTime?: number;   // Make startTime optional
  }
) {
  // Calculate start time if not provided
  const startTime = context.startTime || performance.now();
  
  // Process the data through the pipeline
  const result = await practiceAreaPipeline.process(data, {
    ...context,
    startTime,
  });
  
  return result;
}
