'use server';

import { auth } from '@repo/auth/server';
import { getTenantDbClientUtil } from '@/app/utils/get-tenant-db-connection';
import { getInternalUserId } from '@/app/actions/users/users-actions';
import { queryLawyers, updateLawyerProfile, queryTeamMembership, insertTeamMembership, type LawyerProfile, type LawyerFilters } from '@repo/database/src/tenant-app/queries/lawyers-queries';
import { revalidatePath } from 'next/cache';

export type { LawyerProfile, LawyerFilters };

export async function getLawyers(filters?: LawyerFilters): Promise<{ status: string; data?: LawyerProfile[]; message?: string }> {
  try {
    // Verify authentication
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return { status: 'error', message: 'Unauthorized' };
    }

    // Get tenant database connection
    const db = await getTenantDbClientUtil();
    
    // Use query function to fetch lawyers with filters
    const lawyers = await queryLawyers(db, filters);

    return { status: 'success', data: lawyers };
  } catch (error) {
    console.error('Error fetching lawyers:', error);
    return { status: 'error', message: 'Failed to fetch lawyers' };
  }
}

export async function updateLawyer(lawyerId: string, data: {
  name?: string;
  lastName?: string;
  maternalLastName?: string;
  practiceArea?: string;
  isLeadLawyer?: boolean;
}) {
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

    const updatedLawyer = await updateLawyerProfile(db, lawyerId, {
      ...data,
      updatedBy: internalUserId
    });

    revalidatePath('/my-firm');

    return { status: 'success', data: updatedLawyer };
  } catch (error) {
    console.error('Error updating lawyer:', error);
    return { status: 'error', message: 'Failed to update lawyer' };
  }
}

export async function assignToTeam(data: {
  profileId: string;
  teamId: string;
  role: string;
}) {
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

    const existingAssignment = await queryTeamMembership(db, {
      profileId: data.profileId,
      teamId: data.teamId
    });

    if (existingAssignment) {
      return { status: 'error', message: 'Lawyer is already assigned to this team' };
    }

    const assignment = await insertTeamMembership(db, {
      ...data,
      createdBy: internalUserId
    });

    revalidatePath('/my-firm');

    return { status: 'success', data: assignment };
  } catch (error) {
    console.error('Error assigning to team:', error);
    return { status: 'error', message: 'Failed to assign to team' };
  }
}
