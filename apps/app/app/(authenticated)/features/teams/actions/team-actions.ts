// 'use server';

// import { auth } from '@repo/auth/server';
// import { getTenantDbClientUtil } from '@/app/utils/get-tenant-db-connection';
// import { teamSchema } from '@repo/schema/entities/team';
// import { teamPipeline } from '@repo/schema/pipeline/team-pipeline';
// import { recordNormalizationEvent } from '@repo/schema/events/normalization-events';
// import { ResilientNormalizer } from '@repo/schema/resilience/error-handler';
// import { monitorEntityQuality } from '@repo/schema/monitoring/data-quality';
// import { getCurrentSchema } from '@repo/schema/evolution/schema-versions';
// import { revalidatePath } from 'next/cache';

// export async function createTeamAction(formData: any) {
//   const { userId } = await auth();
//   if (!userId) {
//     return {
//       status: 'error' as const,
//       message: 'No autorizado',
//     };
//   }

//   try {
//     // Record start time for performance tracking
//     const startTime = performance.now();
    
//     // Get current schema version
//     const teamSchema = getCurrentSchema<any>('team');
    
//     // Create resilient normalizer
//     const resilientNormalizer = new ResilientNormalizer({
//       strategy: 'use-partial',
//       defaultValues: {
//         name: 'Untitled Team',
//         members: [],
//       },
//     });
    
//     // Apply resilient normalization
//     const normResult = await resilientNormalizer.normalize(
//       teamSchema,
//       formData,
//       { userId, source: 'team-creation-form' }
//     );
    
//     // If using fallback, log warning
//     if (normResult.usedFallback) {
//       console.warn('Using fallback normalization for team:', normResult.errors?.message);
//     }
    
//     // Monitor data quality
//     const qualityScores = monitorEntityQuality('team', normResult.result);
    
//     // Process through pipeline for consistency
//     const pipeline = enhanceTeamPipelineWithLogging(teamPipeline);
//     const { result, changes } = await pipeline.process(normResult.result, {
//       userId,
//       operation: 'create',
//       source: 'team-creation-form',
//       startTime,
//     });
    
//     // Get database client
//     const tenantDb = await getTenantDbClientUtil();
    
//     // Check if team name already exists
//     const exists = await tenantDb.query.teams.findFirst({
//       where: (teams, { eq }) => eq(teams.name, result.name),
//     });
    
//     if (exists) {
//       return {
//         status: 'error' as const,
//         message: `Ya existe un equipo con el nombre "${result.name}"`,
//       };
//     }
    
//     // Create team with transaction
//     const teamResult = await tenantDb.transaction(async (tx) => {
//       // Insert team
//       const [team] = await tx.insert(teams).values({
//         name: result.name,
//         description: result.description,
//         practiceArea: result.practiceArea,
//         department: result.department,
//         createdBy: userId,
//         updatedBy: userId,
//       }).returning();
      
//       // Add members
//       if (result.members?.length) {
//         // Implementation details...
//       }
      
//       return {
//         team,
//         memberCount: result.members?.length || 0,
//         quality: qualityScores,
//         performance: {
//           totalTime: performance.now() - startTime,
//         },
//       };
//     });
    
//     // Record completion event
//     await recordNormalizationEvent({
//       entityType: 'team',
//       operation: 'create',
//       source: 'team-creation-form',
//       userId,
//       data: teamResult.team,
//       changes,
//       processingTime: performance.now() - startTime,
//     });
    
//     revalidatePath('/teams');
    
//     return {
//       status: 'success' as const,
//       data: teamResult.team,
//       message: `Equipo "${teamResult.team.name}" creado exitosamente con ${teamResult.memberCount} miembros`,
//       quality: teamResult.quality,
//       performance: teamResult.performance,
//     };
//   } catch (error) {
//     // Enhanced error handling
//     console.error('Error creating team:', error);
    
//     // Record error event
//     await recordNormalizationEvent({
//       entityType: 'team',
//       operation: 'create',
//       source: 'team-creation-form',
//       userId,
//       data: formData,
//       changes: {
//         error: {
//           original: null,
//           normalized: error instanceof Error ? error.message : String(error),
//         }
//       },
//     });
    
//     let message = 'Error al crear el equipo';
//     // Error handling details...
    
//     return {
//       status: 'error' as const,
//       message,
//     };
//   }
// }