'use server';

import { auth } from '@repo/auth/server';
import { getTenantDbClientUtil } from '@/app/utils/get-tenant-db-connection';
import { getInternalUserId } from '@/app/actions/users/users-actions';
import { queryTeams, type TeamWithMembers } from '@repo/database/src/tenant-app/queries/teams';
import { revalidatePath } from 'next/cache';
import { createTeam as createTeamAction } from './create-team';
import { CreateTeamFormData } from '../schemas';

export type { TeamWithMembers };

export async function getTeams(): Promise<{ status: string; data?: TeamWithMembers[]; message?: string }> {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return { status: 'error', message: 'Unauthorized' };
    }

    const db = await getTenantDbClientUtil();
    const teams = await queryTeams(db);
    
    // Debug logs
    console.log('Teams fetched:', JSON.stringify(teams, null, 2));
    console.log('Number of teams:', teams.length);
    
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
  teamMembers: { userId: string; role: 'leader' | 'member' }[]; // userId is actually the profile ID
}): Promise<{ success: boolean; teamId: string; message?: string }> {
  try {
    // Get the internal user ID
    const internalUserId = await getInternalUserId();
    if (!internalUserId) {
      return {
        success: false,
        teamId: '',
        message: 'No se pudo obtener el ID del usuario. Por favor, inicia sesión nuevamente.'
      };
    }

    // Convert the data to match CreateTeamFormData
    const formData: CreateTeamFormData = {
      name: data.name,
      description: data.description,
      practiceArea: data.practiceArea || '',
      department: data.department || '',
      teamMembers: data.teamMembers // These contain profile IDs, not user IDs
    };

    // Use the createTeam function from create-team.ts
    const result = await createTeamAction(formData);
    
    return { 
      success: true, 
      teamId: result.teamId,
      message: result.message
    };
  } catch (error) {
    console.error('Error creating team:', error);
    return { 
      success: false, 
      teamId: '',
      message: error instanceof Error ? error.message : 'Failed to create team'
    };
  }
}
