// packages/schema/src/pipeline/department-pipeline.ts
import { createTransformPipeline } from './index';
import { departmentSchema } from '../entities/department';
import { normalizeText } from '../utils/normalize';
import { monitorDataQuality } from '../monitoring';
import { ResilientNormalizer } from '../resilience/error-handler';

// Sanitization stage
function sanitizeDepartmentData(data: any) {
  return {
    ...data,
    name: data.name?.trim() ?? '',
    description: data.description?.trim() ?? '',
  };
}

// Normalization stage
function normalizeDepartmentData(data: any) {
  return {
    ...data,
    name: normalizeText.titleCase(data.name),
  };
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
      transform: async (data, context) => {
        const resilientValidator = new ResilientNormalizer({ strategy: 'use-partial' });
        const validationResult = await resilientValidator.normalize(departmentSchema, data, context);
        if (!validationResult.success) {
          console.warn("[Validation Stage] Validation errors, using partial data:", validationResult.errors);
        }
        return validationResult.result;
      },
    },
    {
      name: 'monitor',
      transform: (data) => monitorDataQuality('department', data),
    },
  ],
});

// Export a function to process department data
export async function processDepartmentData(
  data: any, 
  context: { 
    userId: string; 
    source: string; 
    operation?: string;   // Make operation optional
    startTime?: number;   // Make startTime optional
  }
) {
  return departmentPipeline.process(data, {
    userId: context.userId,
    source: context.source,
    timestamp: Date.now(),
    // Optionally pass through other context properties if needed
  });
}