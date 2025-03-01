// packages/schema/src/pipeline/team-pipeline.ts
import { createTransformPipeline } from './index';
import { teamSchema } from '../entities/team';
import { normalizeText } from '../utils/normalize';
import { monitorDataQuality } from '../monitoring';
import { ResilientNormalizer } from '../resilience/error-handler';
import { recordNormalizationEvent } from '../events';

// Sanitization stage - sanitizes and cleans input data
function sanitizeTeamData(data: any) {
  // HTML Sanitation would happen here
  const sanitized = {
    ...data,
    name: data.name?.trim() ?? '',
    description: data.description?.trim() ?? '',
    practiceArea: data.practiceArea?.trim() ?? '',
    department: data.department?.trim() ?? '',
    members: Array.isArray(data.members) ? data.members : [],
  };

  // Log sanitization
  console.log('[Sanitization Stage] Team data sanitized', {
    originalName: data.name,
    sanitizedName: sanitized.name,
  });

  return sanitized;
}

// Normalization stage - standardizes data formats
function normalizeTeamData(data: any) {
  const normalized = {
    ...data,
    name: normalizeText.titleCase(data.name),
    practiceArea: data.practiceArea ? normalizeText.titleCase(data.practiceArea) : data.practiceArea,
    department: data.department ? normalizeText.titleCase(data.department) : data.department,
    // Ensure each member has a properly formatted role
    members: data.members.map((member: any) => ({
      ...member,
      role: member.role?.toLowerCase() === 'leader' ? 'leader' : 'member',
    })),
  };

  // Log normalization
  console.log('[Normalization Stage] Team data normalized', {
    originalName: data.name,
    normalizedName: normalized.name,
  });

  return normalized;
}

// Validation stage with resilience
async function validateTeamData(data: any, context: any) {
  const resilientValidator = new ResilientNormalizer({ 
    strategy: 'use-partial',
    defaultValues: {
      name: 'Untitled Team',
      members: [],
    },
    logErrors: true,
  });

  const validationResult = await resilientValidator.normalize(teamSchema, data, context);
  
  if (!validationResult.success) {
    console.warn("[Validation Stage] Validation errors, using partial data:", validationResult.errors);
  }
  
  return validationResult.result;
}

// Create resilient pipeline with observability
export const teamPipeline = createTransformPipeline({
  name: 'teamDataPipeline',
  stages: [
    {
      name: 'sanitize',
      transform: sanitizeTeamData,
    },
    {
      name: 'normalize',
      transform: normalizeTeamData,
    },
    {
      name: 'validate',
      transform: validateTeamData,
    },
    {
      name: 'monitor',
      transform: (data) => monitorDataQuality('team', data),
    },
  ],
});

// Export a function to process team data
export async function processTeamData(
  data: any, 
  context: { 
    userId: string; 
    source: string; 
    operation?: string;   // Make operation optional
    startTime?: number;   // Make startTime optional
  }
) {
  const startTime = context.startTime || performance.now();
  
  try {
    const result = await teamPipeline.process(data, {
      userId: context.userId,
      source: context.source,
      operation: context.operation || 'create',
      timestamp: Date.now(),
    });
    
    // Record normalization event
    await recordNormalizationEvent({
      entityType: 'team',
      operation: (context.operation || 'create') as any,
      data: result.result,
      changes: result.changes.map(change => ({
        stage: change.stage,
        field: change.field,
        originalValue: change.originalValue,
        newValue: change.newValue
      })),
      context: {
        userId: context.userId,
        source: context.source,
        timestamp: Date.now()
      }
    });
    
    return result;
  } catch (error) {
    // Record error event
    await recordNormalizationEvent({
      entityType: 'team',
      operation: (context.operation || 'create') as any,
      data: data,
      changes: [{
        stage: 'pipeline',
        field: 'error',
        originalValue: null,
        newValue: error instanceof Error ? error.message : String(error)
      }],
      context: {
        userId: context.userId,
        source: context.source,
        timestamp: Date.now()
      }
    });
    
    throw error;
  }
}