'use server';

import { getTenantDbClientUtil } from "@/app/utils/get-tenant-db-connection";
import { getInternalUserId } from "@/app/actions/users/users-actions";
import { createTeamSchema, type CreateTeamFormData } from '../schemas';
import { TeamQueries } from '@repo/database/src/tenant-app/queries/teams';
import { revalidatePath } from 'next/cache';

export async function createTeam(data: CreateTeamFormData) {
  try {
    // Validate input data using the centralized schema
    const validationResult = createTeamSchema.safeParse(data);
    if (!validationResult.success) {
      const issues = validationResult.error.issues.map(issue => issue.message).join(", ");
      throw new Error(`Datos de formulario inválidos: ${issues}`);
    }
    
    const validatedData = validationResult.data;
    
    // Get current user's internal ID
    const currentUserId = await getInternalUserId();
    if (!currentUserId) {
      throw new Error("Debes estar autenticado para crear un equipo");
    }

    const tenantDb = await getTenantDbClientUtil();
    const teamQueries = new TeamQueries(tenantDb);

    // Create team with members (note: teamMembers.userId contains profile IDs, not user IDs)
    const teamCreationResult = await teamQueries.createTeam(
      {
        name: validatedData.name,
        description: validatedData.description,
        practiceArea: validatedData.practiceArea,
        department: validatedData.department,
        createdBy: currentUserId,
        updatedBy: currentUserId,
      },
      validatedData.teamMembers
    );

    // Revalidate the page to show new data
    revalidatePath('/my-firm');

    return teamCreationResult;
  } catch (error) {
    console.error("Error creating team:", error);
    throw new Error(error instanceof Error ? error.message : "Ocurrió un error inesperado al crear el equipo");
  }
}