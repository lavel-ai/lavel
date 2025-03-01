'use server';

import { db } from '@repo/database';
import { teamPracticeAreas } from '@repo/database/src/tenant-app/schema/team-practice-areas-schema';
import { eq, and, isNull } from 'drizzle-orm';
import { ApiResponse } from '../../law-branches/actions/practice-area-actions';

/**
 * Interface representing a team's practice area with additional metadata
 */
export interface TeamPracticeArea {
  id: string;
  lawBranchId: number;
  lawBranchName: string;
  isPrimary: boolean;
}

/**
 * Fetches all practice areas for a specific team
 * @param teamId - The ID of the team to fetch practice areas for
 * @returns A list of practice areas associated with the team
 */
export async function getTeamPracticeAreas(teamId: string): Promise<ApiResponse<TeamPracticeArea[]>> {
  try {
    const results = await db.query.teamPracticeAreas.findMany({
      where: (tpa, { eq, isNull }) => and(
        eq(tpa.teamId, teamId),
        isNull(tpa.deletedAt)
      ),
      with: {
        lawBranch: true
      },
      columns: {
        id: true,
        lawBranchId: true,
        isPrimary: true
      }
    });

    return {
      status: 'success',
      data: results.map(result => ({
        id: result.id,
        lawBranchId: result.lawBranchId,
        lawBranchName: result.lawBranch.name,
        isPrimary: result.isPrimary
      }))
    };
  } catch (error) {
    console.error('Error fetching team practice areas:', error);
    return {
      status: 'error',
      message: 'Error fetching team practice areas'
    };
  }
}

/**
 * Updates a team's practice areas
 * @param teamId - The ID of the team to update practice areas for
 * @param lawBranchIds - The IDs of the law branches to associate with the team
 * @param userId - The ID of the user making the change (for audit)
 * @returns Success or error response
 */
export async function updateTeamPracticeAreas(
  teamId: string, 
  lawBranchIds: number[],
  userId: string
): Promise<ApiResponse<void>> {
  try {
    // Begin transaction
    await db.transaction(async (tx) => {
      // Soft delete all existing practice areas for the team
      await tx
        .update(teamPracticeAreas)
        .set({
          deletedAt: new Date(),
          deletedBy: userId,
          updatedAt: new Date(),
          updatedBy: userId
        })
        .where(
          and(
            eq(teamPracticeAreas.teamId, teamId),
            isNull(teamPracticeAreas.deletedAt)
          )
        );

      // Insert new practice areas
      if (lawBranchIds.length > 0) {
        // If first one, set as primary
        const insertPromises = lawBranchIds.map((lawBranchId, index) => 
          tx.insert(teamPracticeAreas).values({
            teamId,
            lawBranchId,
            isPrimary: index === 0, // First one is primary
            createdBy: userId,
            updatedBy: userId
          })
        );
        
        await Promise.all(insertPromises);
      }
    });

    return {
      status: 'success'
    };
  } catch (error) {
    console.error('Error updating team practice areas:', error);
    return {
      status: 'error',
      message: 'Error updating team practice areas'
    };
  }
} 