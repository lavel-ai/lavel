// packages/schema/src/pipeline/team-pipeline.ts
import { createTransformPipeline } from './index';
import { teamSchema } from '../entities/team';
import { normalizeText } from '../utils/normalize';
import { monitorDataQuality } from '../monitoring';

// Sanitization stage
function sanitizeTeamData(data: any) {
  return {
    ...data,
    name: data.name?.trim() ?? '',
    description: data.description?.trim() ?? '',
    practiceArea: data.practiceArea?.trim() ?? '',
    department: data.department?.trim() ?? '',
    members: Array.isArray(data.members) ? data.members : [],
  };
}

// Normalization stage
function normalizeTeamData(data: any) {
  return {
    ...data,
    name: normalizeText.titleCase(data.name),
    practiceArea: data.practiceArea ? normalizeText.titleCase(data.practiceArea) : data.practiceArea,
    department: data.department ? normalizeText.titleCase(data.department) : data.department,
  };
}

// Create pipeline
export const teamPipeline = createTransformPipeline({
  name: 'team',
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
      transform: (data) => {
        const result = teamSchema.safeParse(data);
        if (!result.success) {
          throw new Error(`Validation failed: ${result.error.message}`);
        }
        return result.data;
      },
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
  context: { userId: string; source: string; }
) {
  return teamPipeline.process(data, {
    userId: context.userId,
    source: context.source,
    timestamp: Date.now(),
  });
}