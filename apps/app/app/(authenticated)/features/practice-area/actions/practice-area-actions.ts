'use server';

import { revalidatePath } from 'next/cache';
import { unstable_cache, revalidateTag } from 'next/cache';
import { getTenantDbClientUtil } from '@/app/utils/get-tenant-db-connection';
import { getInternalUserId } from '@/app/actions/users/user-actions';
import { lawBranches } from '@repo/database/src/tenant-app/schema/law-branches-schema';
import { asc, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { practiceAreaSchema } from '@repo/schema/src/entities/practice-area';
import { processPracticeAreaData } from '@repo/schema/src/pipeline/practice-area-pipeline';
import { sql } from 'drizzle-orm';
import * as practiceAreaQueries from '@repo/database/src/tenant-app/queries/practice-area-queries';

/**
 * Represents a practice area option that can be selected in the UI
 */
export interface PracticeAreaOption {
  id: number;
  name: string;
  description?: string | null;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  createdBy?: string;
  updatedBy?: string;
  deletedBy?: string | null;
}

/**
 * Standard API response format
 */
export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  error?: {
    code: string;
    details?: any;
  };
}

const CACHE_TAG = 'practice-areas';

/**
 * Fetches all practice areas from the database
 * @returns A list of practice areas with their details
 */
export const getPracticeAreas = unstable_cache(
  async (): Promise<ApiResponse<PracticeAreaOption[]>> => {
    try {
      console.log("Attempting to fetch practice areas...");
      
      // Get the tenant database client
      const db = await getTenantDbClientUtil();
      console.log("Successfully connected to tenant database");
      
      // Query the database using the query function
      const areas = await practiceAreaQueries.getPracticeAreas(db);
      
      console.log(`Found ${areas.length} practice areas`);
      
      return {
        status: 'success',
        data: areas,
      };
    } catch (error) {
      // Improved error logging with more details
      console.error('Error fetching practice areas:', error);
      console.error('Error details:', JSON.stringify({
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Not an Error object'
      }, null, 2));
      
      return {
        status: 'error',
        message: 'Error al obtener áreas de práctica',
        error: {
          code: 'FETCH_ERROR',
          details: error instanceof Error ? { message: error.message, name: error.name } : error,
        },
      };
    }
  },
  ['practice-areas-list'],
  {
    tags: [CACHE_TAG],
    revalidate: 3600, // Cache for 1 hour
  }
);

/**
 * Direct version of getPracticeAreas without caching - for debugging purposes
 */
export async function getPracticeAreasNoCache(): Promise<ApiResponse<PracticeAreaOption[]>> {
  console.log("Starting getPracticeAreasNoCache with direct DB access...");
  
  try {
    // Connect to database
    console.log("Attempting to connect to tenant database...");
    const db = await getTenantDbClientUtil();
    console.log("Successfully connected to tenant database");
    
    // Log db instance details (safely)
    console.log("DB client type:", typeof db);
    console.log("DB client available:", !!db);

    // Execute raw SQL query first for direct debugging
    console.log("Attempting direct SQL query...");
    try {
      const directResult = await practiceAreaQueries.executeRawPracticeAreaQuery(db);
      console.log("Direct SQL query result count:", directResult.rowCount);
      console.log("Direct SQL query first row:", directResult.rows[0] ? JSON.stringify(directResult.rows[0]) : "No rows");
    } catch (sqlError) {
      console.error("Direct SQL query failed:", sqlError instanceof Error ? sqlError.message : "Unknown error", 
        sqlError instanceof Error ? sqlError.stack : "");
    }
    
    // Query the database using the query function
    console.log("Attempting to query lawBranches table...");
    let areas = [];
    
    try {
      areas = await practiceAreaQueries.getPracticeAreas(db);
      
      console.log(`Found ${areas.length} practice areas`);
      if (areas.length > 0) {
        console.log("First practice area:", JSON.stringify(areas[0]));
      } else {
        console.log("No practice areas found");
      }
    } catch (queryError) {
      console.error("Error during query:", queryError instanceof Error ? queryError.message : "Unknown error",
        queryError instanceof Error ? queryError.stack : "");
      return {
        status: 'error',
        message: `Error querying lawBranches: ${queryError instanceof Error ? queryError.message : "Unknown error"}`,
      };
    }
    
    // Check for returned data
    if (!areas || !Array.isArray(areas)) {
      console.error("Unexpected response format from DB:", areas);
      return {
        status: 'error',
        message: 'Received invalid response format from database',
      };
    }
    
    // Map the areas directly without using processPracticeAreaData
    const mappedAreas: PracticeAreaOption[] = areas.map(area => ({
      id: area.id,
      name: area.name,
      description: area.description,
      active: area.active,
      // Per schema, these are already strings, no need for toISOString()
      createdAt: area.createdAt,
      updatedAt: area.updatedAt,
      deletedAt: area.deletedAt,
      createdBy: area.createdBy,
      updatedBy: area.updatedBy,
    }));
    
    console.log("Successfully mapped practice areas");
    
    // Process the returned data
    return {
      status: 'success',
      data: mappedAreas,
    };
  } catch (error) {
    // Log full error details for debugging
    console.error("Error in getPracticeAreasNoCache:", error instanceof Error ? error.message : "Unknown error");
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    
    if (error instanceof Error && error.message.includes("connect")) {
      return {
        status: 'error',
        message: `Database connection error: ${error.message}`,
      };
    }
    
    return {
      status: 'error',
      message: `Error fetching practice areas: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Completely invalidates all practice area related caches
 */
function invalidatePracticeAreaCache() {
  // Revalidate the cache tag used by the unstable_cache wrapper
  console.log(`Invalidating cache tag: ${CACHE_TAG}`);
  revalidateTag(CACHE_TAG);
  
  // Also revalidate the paths where practice areas are displayed
  console.log('Revalidating practice area paths...');
  revalidatePath('/(authenticated)/practice-areas');  // List view
  revalidatePath('/(authenticated)/departments');     // Used in departments page
}

/**
 * Creates a new practice area
 */
export async function createPracticeArea(
  formData: z.infer<typeof practiceAreaSchema>
): Promise<ApiResponse<PracticeAreaOption>> {
  try {
    const userId = await getInternalUserId();
    if (!userId) {
      return {
        status: 'error',
        message: 'Usuario no autorizado',
        error: {
          code: 'UNAUTHORIZED',
        },
      };
    }

    // Process the data through our pipeline for normalization and validation
    const processResult = await processPracticeAreaData(formData, {
      userId: userId,
      source: 'web-app',
      operation: 'create',
    });
    
    // Get the normalized and validated data from the pipeline result
    const processedData = processResult.result;

    const db = await getTenantDbClientUtil();
    
    // Check if practice area with same name already exists - use fresh query to bypass cache
    console.log(`Checking if practice area with name "${processedData.name}" already exists (fresh query)...`);
    const exists = await practiceAreaQueries.practiceAreaExistsByName(
      db, 
      processedData.name, 
      null,
      true // Force a fresh database query to bypass cache
    );
    console.log(`Practice area existence check result: ${exists}`);

    if (exists) {
      return {
        status: 'error',
        message: 'Ya existe un área de práctica con este nombre',
        error: {
          code: 'DUPLICATE_NAME',
        },
      };
    }

    try {
      // Create the practice area using the query function
      console.log(`Creating new practice area: ${processedData.name}...`);
      const created = await practiceAreaQueries.createPracticeArea(db, processedData, userId);
      console.log(`Successfully created practice area with ID: ${created.id}`);

      // Thoroughly invalidate all practice area cache
      invalidatePracticeAreaCache();

      return {
        status: 'success',
        data: created,
        message: 'Área de práctica creada con éxito',
      };
    } catch (insertError) {
      console.error('Error inserting practice area:', insertError);
      console.error('Insert error details:', JSON.stringify({
        message: insertError instanceof Error ? insertError.message : 'Unknown error',
        name: insertError instanceof Error ? insertError.name : 'Not an Error object'
      }, null, 2));
      
      throw insertError; // Re-throw to be caught by the outer try/catch
    }
  } catch (error) {
    console.error('Error creating practice area:', error);
    console.error('Error details:', JSON.stringify({
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Not an Error object'
    }, null, 2));
    
    return {
      status: 'error',
      message: 'Error al crear área de práctica',
      error: {
        code: 'CREATE_ERROR',
        details: error instanceof Error ? { message: error.message, name: error.name } : error,
      },
    };
  }
}

/**
 * Updates an existing practice area
 */
export async function updatePracticeArea(
  id: number,
  formData: z.infer<typeof practiceAreaSchema>
): Promise<ApiResponse<PracticeAreaOption>> {
  try {
    const userId = await getInternalUserId();
    if (!userId) {
      return {
        status: 'error',
        message: 'Usuario no autorizado',
        error: {
          code: 'UNAUTHORIZED',
        },
      };
    }

    // Process the data through our pipeline for normalization and validation
    const processResult = await processPracticeAreaData(formData, {
      userId: userId,
      source: 'web-app',
      operation: 'update',
    });
    
    // Get the normalized and validated data from the pipeline result
    const processedData = processResult.result;

    const db = await getTenantDbClientUtil();
    
    // Check if practice area with same name already exists (excluding this ID) - use fresh query
    console.log(`Checking if practice area with name "${processedData.name}" already exists (excluding ID ${id}, fresh query)...`);
    const exists = await practiceAreaQueries.practiceAreaExistsByName(
      db, 
      processedData.name, 
      id, 
      true // Force a fresh database query to bypass cache
    );
    console.log(`Practice area existence check result: ${exists}`);

    if (exists) {
      return {
        status: 'error',
        message: 'Ya existe un área de práctica con este nombre',
        error: {
          code: 'DUPLICATE_NAME',
        },
      };
    }

    try {
      // Update the practice area using the query function
      console.log(`Updating practice area ID ${id}...`);
      const updated = await practiceAreaQueries.updatePracticeArea(db, id, processedData, userId);
      console.log(`Successfully updated practice area ID ${id}`);

      // Thoroughly invalidate all practice area cache
      invalidatePracticeAreaCache();

      return {
        status: 'success',
        data: updated,
        message: 'Área de práctica actualizada con éxito',
      };
    } catch (updateError) {
      console.error('Error updating practice area:', updateError);
      console.error('Update error details:', JSON.stringify({
        message: updateError instanceof Error ? updateError.message : 'Unknown error',
        name: updateError instanceof Error ? updateError.name : 'Not an Error object'
      }, null, 2));
      
      throw updateError; // Re-throw to be caught by the outer try/catch
    }
  } catch (error) {
    console.error('Error updating practice area:', error);
    console.error('Error details:', JSON.stringify({
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Not an Error object'
    }, null, 2));
    
    return {
      status: 'error',
      message: 'Error al actualizar área de práctica',
      error: {
        code: 'UPDATE_ERROR',
        details: error instanceof Error ? { message: error.message, name: error.name } : error,
      },
    };
  }
}

/**
 * Deletes a practice area
 */
export async function deletePracticeArea(id: number): Promise<ApiResponse<null>> {
  try {
    const userId = await getInternalUserId();
    if (!userId) {
      return {
        status: 'error',
        message: 'Usuario no autorizado',
        error: {
          code: 'UNAUTHORIZED',
        },
      };
    }

    const db = await getTenantDbClientUtil();
    
    // Delete the practice area using the query function (soft delete)
    await practiceAreaQueries.deletePracticeArea(db, id, userId);

    // Thoroughly invalidate all practice area cache
    invalidatePracticeAreaCache();

    return {
      status: 'success',
      message: 'Área de práctica eliminada con éxito',
    };
  } catch (error) {
    console.error('Error deleting practice area:', error);
    return {
      status: 'error',
      message: 'Error al eliminar área de práctica',
      error: {
        code: 'DELETE_ERROR',
        details: error,
      },
    };
  }
}