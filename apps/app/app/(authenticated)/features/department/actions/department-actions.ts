// apps/app/app/(authenticated)/features/departments/actions/department-actions.ts
'use server';

import { auth } from '@repo/auth/server';
import { getTenantDbClientUtil } from '@/app/utils/get-tenant-db-connection';
import { getInternalUserId } from '@/app/actions/users/users-actions';
import { processDepartmentData } from '@repo/schema/src/pipeline/department-pipeline';
import { revalidatePath } from 'next/cache';
import { recordNormalizationEvent } from '@repo/schema/src/events/';
import { departments } from '@repo/database/src/tenant-app/schema/departments-schema';
import { eq } from 'drizzle-orm';

export async function createDepartment(formData: { name: string; description?: string }) {
  try {
    // Verify Clerk authentication
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return { status: 'error', message: 'No autorizado' };
    }

    // Get internal user ID from Clerk ID
    const internalUserId = await getInternalUserId();
    if (!internalUserId) {
      return { status: 'error', message: 'Usuario interno no encontrado' };
    }

    // Record start time for performance tracking
    const startTime = performance.now();
    
    // Process through pipeline for normalization, validation, and monitoring
    const { result, changes, metrics } = await processDepartmentData(formData, {
      userId: internalUserId,
      operation: 'create',
      source: 'department-creation-form',
      startTime,
    });
    
    // Get database client
    const tenantDb = await getTenantDbClientUtil();
    
    // Check if department name already exists
    const exists = await tenantDb.query.departments.findFirst({
      where: eq(departments.name, result.name),
    });
    
    if (exists) {
      return {
        status: 'error',
        message: `Ya existe un departamento con el nombre "${result.name}"`,
      };
    }
    
    // Create department with transaction
    // Let Drizzle handle the mapping between camelCase fields and snake_case columns
    const [departmentResult] = await tenantDb.insert(departments).values({
      name: result.name,
      description: result.description,
      createdBy: internalUserId,
      updatedBy: internalUserId,
      // Let the defaultNow() handle createdAt and updatedAt
    }).returning();
    
    // Record completion event
    await recordNormalizationEvent({
      entityType: 'department',
      operation: 'create',
      data: departmentResult,
      changes,
      context: {
        userId: internalUserId,
        source: 'department-creation-form',
        timestamp: Date.now(),
      },
    });
    
    revalidatePath('/my-firm');
    
    return {
      status: 'success',
      data: departmentResult,
      message: `Departamento "${departmentResult.name}" creado exitosamente`,
      quality: metrics,
      performance: {
        totalTime: performance.now() - startTime,
      },
    };
  } catch (error) {
    console.error('Error creating department:', error);
    
    // Get internal user ID for error reporting
    const internalUserId = await getInternalUserId();
    
    // Record error event
    await recordNormalizationEvent({
      entityType: 'department',
      operation: 'create',
      data: formData,
      // Fix the changes format to match the expected array structure
      changes: [{
        stage: 'error',
        field: 'global',
        originalValue: null,
        newValue: error instanceof Error ? error.message : String(error),
      }],
      context: {
        userId: internalUserId || 'unknown',
        source: 'department-creation-form',
        timestamp: Date.now(),
      },
    });
    
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al crear el departamento',
    };
  }
}