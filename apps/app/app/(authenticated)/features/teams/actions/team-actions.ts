'use server';

import { auth } from '@repo/auth/server';
import { getTenantDbClientUtil } from '@/app/utils/get-tenant-db-connection';
import { getInternalUserId } from '@/app/actions/users/users-actions';
import { queryTeams, insertTeam, insertTeamMembers, type TeamWithMembers } from '@repo/database/src/tenant-app/queries/teams';
import { revalidatePath } from 'next/cache';

export type { TeamWithMembers };

export async function getTeams(): Promise<{ status: string; data?: TeamWithMembers[]; message?: string }> {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return { status: 'error', message: 'Unauthorized' };
    }

    const db = await getTenantDbClientUtil();
    const teams = await queryTeams(db);

    return { status: 'success', data: teams };
  } catch (error) {
    console.error('Error fetching teams:', error);
    return { status: 'error', message: 'Failed to fetch teams' };
  }
}

export async function createTeam(data: {
  name: string;
  description?: string;
  practiceArea?: string;
  department?: string;
  memberIds: string[];
}): Promise<{ status: string; data?: { teamId: string }; message?: string }> {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return { status: 'error', message: 'Unauthorized' };
    }

    const internalUserId = await getInternalUserId();
    if (!internalUserId) {
      return { status: 'error', message: 'Internal user ID not found' };
    }

    const db = await getTenantDbClientUtil();

    try {
      // Create the team
      const team = await insertTeam(db, {
        name: data.name,
        description: data.description || null,
        practiceArea: data.practiceArea || null,
        department: data.department || null,
        createdBy: internalUserId
      });

      // Add team members if any
      if (data.memberIds.length > 0) {
        await insertTeamMembers(db, 
          data.memberIds.map(profileId => ({
            teamId: team.id,
            profileId,
            role: 'member',
            createdBy: internalUserId
          }))
        );
      }

      // Revalidate the page to show new data
      revalidatePath('/my-firm');

      return { 
        status: 'success', 
        data: { teamId: team.id }
      };
    } catch (error) {
      if (error instanceof Error) {
        return { 
          status: 'error', 
          message: error.message 
        };
      }
      throw error;
    }
  } catch (error) {
    console.error('Error creating team:', error);
    if (error instanceof Error) {
      return { status: 'error', message: error.message };
    }
    return { status: 'error', message: 'Failed to create team' };
  }
}
