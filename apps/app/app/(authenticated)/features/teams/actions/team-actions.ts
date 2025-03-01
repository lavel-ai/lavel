'use server';

import { auth } from '@repo/auth/server';
import { getTenantDbClientUtil } from "@/app/utils/get-tenant-db-connection";
import { getInternalUserId } from "@/app/actions/users/users-actions";
import { TeamQueries } from '@repo/database/src/tenant-app/queries/teams';
import { revalidatePath } from 'next/cache';
import { processTeamData } from '@repo/schema/src/pipeline/team-pipeline';

// Define our form data type based on the schema
export type CreateTeamFormData = {
  name: string;
  description?: string;
  practiceArea: string;
  departmentId: string;
  members: Array<{
    userId: string;
    role: 'leader' | 'member';
  }>;
};

export async function createTeam(data: CreateTeamFormData) {
  try {
    // Get current user's ID from auth
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return { 
        success: false, 
        message: "Unauthorized" 
      };
    }

    // Get internal user ID
    const internalUserId = await getInternalUserId();
    if (!internalUserId) {
      return { 
        success: false, 
        message: "Internal user ID not found" 
      };
    }

    // Record start time for performance tracking
    const startTime = performance.now();
    
    // Process team data through our normalization pipeline
    const { result: normalizedData, changes, metrics } = await processTeamData(data, {
      userId: internalUserId,
      source: 'team-creation-form',
      operation: 'create',
      startTime,
    });
    
    // Log the transformations and metrics
    console.log('Team data normalization changes:', changes);
    console.log('Team data normalization metrics:', metrics);
    
    // Get database client
    const db = await getTenantDbClientUtil();
    const teamQueries = new TeamQueries(db);
    
    // Check if team name already exists
    const existingTeam = await teamQueries.checkTeamNameExists(normalizedData.name);
    if (existingTeam) {
      return {
        success: false,
        message: `A team with the name "${normalizedData.name}" already exists`
      };
    }

    // Create team with members
    const teamCreationResult = await teamQueries.createTeam(
      {
        name: normalizedData.name,
        description: normalizedData.description,
        practiceArea: normalizedData.practiceArea,
        departmentId: normalizedData.department,
        createdBy: internalUserId,
        updatedBy: internalUserId,
      },
      // Map the members to the format expected by the teamQueries.createTeam method
      normalizedData.members.map((member: any) => ({
        userId: member.userId,
        role: member.role
      }))
    );

    // Revalidate the page to show new data
    revalidatePath('/my-firm');

    return {
      success: true,
      teamId: teamCreationResult.teamId,
      message: `Team "${normalizedData.name}" created successfully with ${normalizedData.members.length} members`,
      performance: {
        pipelineTime: metrics.totalTime,
        totalTime: performance.now() - startTime
      }
    };
  } catch (error) {
    console.error("Error creating team:", error);
    
    return {
      success: false,
      message: error instanceof Error ? error.message : "An unexpected error occurred while creating the team"
    };
  }
}

export async function getTeams() {
  const db = await getTenantDbClientUtil();
  const teamQueries = new TeamQueries(db);
  return teamQueries.queryTeams();
}

