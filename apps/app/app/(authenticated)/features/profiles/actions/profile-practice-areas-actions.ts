'use server';

import { db } from '@repo/database';
import { profiles } from '@repo/database/src/tenant-app/schema/profiles-schema';
import { profilePracticeAreas } from '@repo/database/src/tenant-app/schema/profile-practice-areas-schema';
import { lawBranches } from '@repo/database/src/tenant-app/schema/law-branches-schema';
import { eq, and, isNull } from 'drizzle-orm';
import { ApiResponse } from '../../practice-area/actions/practice-area-actions';

/**
 * Interface representing a profile's practice area with additional metadata
 */
export interface ProfilePracticeArea {
  id: string;
  lawBranchId: number;
  lawBranchName: string;
  isPrimary: boolean;
  experienceYears?: number | null;
}

/**
 * Fetches all practice areas for a specific profile
 * @param profileId - The ID of the profile to fetch practice areas for
 * @returns A list of practice areas associated with the profile
 */
export async function getProfilePracticeAreas(profileId: string): Promise<ApiResponse<ProfilePracticeArea[]>> {
  try {
    const results = await db.query.profilePracticeAreas.findMany({
      where: (ppa, { eq, isNull }) => and(
        eq(ppa.profileId, profileId),
        isNull(ppa.deletedAt)
      ),
      with: {
        lawBranch: true
      },
      columns: {
        id: true,
        lawBranchId: true,
        isPrimary: true,
        experienceYears: true
      }
    });

    return {
      status: 'success',
      data: results.map(result => ({
        id: result.id,
        lawBranchId: result.lawBranchId,
        lawBranchName: result.lawBranch.name,
        isPrimary: result.isPrimary,
        experienceYears: result.experienceYears
      }))
    };
  } catch (error) {
    console.error('Error fetching profile practice areas:', error);
    return {
      status: 'error',
      message: 'Error fetching profile practice areas'
    };
  }
}

/**
 * Updates a profile's practice areas
 * @param profileId - The ID of the profile to update practice areas for
 * @param lawBranchIds - The IDs of the law branches to associate with the profile
 * @param userId - The ID of the user making the change (for audit)
 * @returns Success or error response
 */
export async function updateProfilePracticeAreas(
  profileId: string, 
  lawBranchIds: number[],
  userId: string
): Promise<ApiResponse<void>> {
  try {
    // Begin transaction
    await db.transaction(async (tx) => {
      // Soft delete all existing practice areas for the profile
      await tx
        .update(profilePracticeAreas)
        .set({
          deletedAt: new Date(),
          deletedBy: userId,
          updatedAt: new Date(),
          updatedBy: userId
        })
        .where(
          and(
            eq(profilePracticeAreas.profileId, profileId),
            isNull(profilePracticeAreas.deletedAt)
          )
        );

      // Insert new practice areas
      if (lawBranchIds.length > 0) {
        // If first one, set as primary
        const insertPromises = lawBranchIds.map((lawBranchId, index) => 
          tx.insert(profilePracticeAreas).values({
            profileId,
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
    console.error('Error updating profile practice areas:', error);
    return {
      status: 'error',
      message: 'Error updating profile practice areas'
    };
  }
} 