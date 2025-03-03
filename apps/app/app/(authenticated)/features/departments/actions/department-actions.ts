'use server'

import { withAuth } from '@/app/utils/with-auth';
import { revalidatePath } from 'next/cache';
import { processDepartmentData } from '@repo/schema/src/pipeline/department-pipeline';
import { 
  getDepartmentQuery, 
  getDepartmentsQuery, 
  insertDepartmentQuery, 
  updateDepartmentQuery,
  softDeleteDepartmentQuery 
} from '@repo/database/src/tenant-app/queries/departments-queries';
import { 
  trackFormSuccess, 
  trackFormError,
  trackEntityCreated, 
  trackEntityUpdated, 
  trackEntityDeleted,
  trackErrorEvent 
} from '@repo/analytics/posthog/actions/server-actions';
import { 
  captureError, 
} from '@repo/observability/error';


/** Get all departments */

export const getDepartments = withAuth(async ({ db, user }) => {
  try {
    const departments = await getDepartmentsQuery(db);
    return { success: true, data: departments };
  } catch (error) {
    const errorMessage = captureError(error, {
      context: 'getDepartments',
      userId: user.id,
      tenantId: user.tenantId,
      source: 'server-action',
      severity: 'medium'
    });
    
    await trackErrorEvent(error, {
      context: 'getDepartments',
      userId: user.id,
      tenantId: user.tenantId,
      source: 'server-action'
    });
    
    return { 
      success: false, 
      error: errorMessage,
      code: 'FETCH_ERROR'
    };
  }
});

// Get department by ID
export const getDepartment = withAuth(async ({ db, user }, id: string) => {
  try {
    const department = await getDepartmentQuery(db, id);
    if (!department) {
      return { 
        success: false, 
        error: 'Department not found',
        code: 'NOT_FOUND'
      };
    }
    return { success: true, data: department };
  } catch (error) {
    const errorMessage = captureError(error, {
      context: 'getDepartment',
      userId: user.id,
      tenantId: user.tenantId,
      source: 'server-action',
      additionalData: { departmentId: id },
      severity: 'medium'
    });
    
    await trackErrorEvent(error, {
      context: 'getDepartment',
      userId: user.id,
      tenantId: user.tenantId,
      source: 'server-action',
      additionalData: { departmentId: id }
    });
    
    return { 
      success: false, 
      error: errorMessage,
      code: 'FETCH_ERROR'
    };
  }
});

// Create department
export const createDepartment = withAuth(async ({ db, user }, prevState: any, formData: FormData) => {
  const startTime = performance.now();
  
  try {
    // Extract form data
    const rawData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string
    };
    
    // Process through pipeline
    const { result, changes, errors, fieldErrors, metadata } = await processDepartmentData(rawData, {
      userId: user.id,
      tenantId: user.tenantId,
      source: 'web-form',
      operation: 'create'
    });
    
    // Check for validation errors
    if (errors && errors.length > 0) {
      // Track form error
      await trackFormError({
        userId: user.id,
        formType: 'department_creation',
        errorMessage: errors.join(', '),
        entityType: 'department',
        fieldsWithErrors: errors.length,
        processingTimeMs: performance.now() - startTime,
        tenantId: user.tenantId,
        source: 'web-form'
      });
      
      return { 
        success: false, 
        error: errors.join(', '),
        fieldErrors,
        changes: [] 
      };
    }
    
    // Insert department
    const department = await insertDepartmentQuery(db, {
      name: result.name,
      description: result.description,
      createdBy: user.id
    });
    
    // Track form success
    await trackFormSuccess({
      userId: user.id,
      formType: 'department_creation',
      processingTimeMs: performance.now() - startTime,
      normalizationChanges: changes.length,
      entityType: 'department',
      entityId: department.id,
      tenantId: user.tenantId,
      source: 'web-form',
      stageMetrics: metadata.stageMetrics
    });
    
    // Track entity created
    await trackEntityCreated({
      userId: user.id,
      entityType: 'department',
      entityId: department.id,
      tenantId: user.tenantId,
      source: 'web-form'
    });
    
    // Revalidate path
    revalidatePath('/departments');
    
    // Return success with normalization changes for user feedback
    return { 
      success: true,
      data: department,
      changes
    };
    
  } catch (error) {
    // Track error
    const errorMessage = captureError(error, {
      context: 'createDepartment',
      userId: user.id,
      tenantId: user.tenantId,
      source: 'web-form',
      additionalData: { formData: Object.fromEntries(formData.entries()) },
      severity: 'medium',
      tags: ['form-submission', 'department', 'creation']
    });
    
    await trackFormError({
      userId: user.id,
      formType: 'department_creation',
      errorMessage: errorMessage,
      entityType: 'department',
      processingTimeMs: performance.now() - startTime,
      tenantId: user.tenantId,
      source: 'web-form'
    });
    
    await trackErrorEvent(error, {
      context: 'createDepartment',
      userId: user.id, 
      tenantId: user.tenantId,
      source: 'web-form',
      additionalData: { formData: Object.fromEntries(formData.entries()) },
      severity: 'medium'
    });
    
    return { 
      success: false,
      error: `Failed to create department: ${errorMessage}`,
      code: 'CREATION_ERROR',
      changes: [] 
    };
  }
});

// Update department
export const updateDepartment = withAuth(async ({ db, user }, prevState: any, formData: FormData) => {
  const startTime = performance.now();
  const departmentId = formData.get('id') as string;
  
  try {
    // Extract form data
    const rawData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string
    };
    
    // Process through pipeline
    const { result, changes, errors, fieldErrors, metadata } = await processDepartmentData(rawData, {
      userId: user.id,
      tenantId: user.tenantId,
      source: 'web-form',
      operation: 'update',
      entityId: departmentId
    });
    
    // Check for validation errors
    if (errors && errors.length > 0) {
      // Track form error
      await trackFormError({
        userId: user.id,
        formType: 'department_update',
        errorMessage: errors.join(', '),
        entityType: 'department',
        entityId: departmentId,
        fieldsWithErrors: errors.length,
        processingTimeMs: performance.now() - startTime,
        tenantId: user.tenantId,
        source: 'web-form'
      });
      
      return { 
        success: false, 
        error: errors.join(', '),
        fieldErrors,
        changes: [] 
      };
    }
    
    // Update department
    const department = await updateDepartmentQuery(db, departmentId, {
      name: result.name,
      description: result.description,
      updatedBy: user.id
    });
    
    // Track form success
    await trackFormSuccess({
      userId: user.id,
      formType: 'department_update',
      processingTimeMs: performance.now() - startTime,
      normalizationChanges: changes.length,
      entityType: 'department',
      entityId: departmentId,
      tenantId: user.tenantId,
      source: 'web-form',
      stageMetrics: metadata.stageMetrics
    });
    
    // Track entity updated
    await trackEntityUpdated({
      userId: user.id,
      entityType: 'department',
      entityId: department.id,
      tenantId: user.tenantId,
      source: 'web-form'
    });
    
    // Revalidate path
    revalidatePath(`/departments/${departmentId}`);
    revalidatePath('/departments');
    
    // Return success with normalization changes for user feedback
    return { 
      success: true,
      data: department,
      changes
    };
    
  } catch (error) {
    // Track error
    const errorMessage = captureError(error, {
      context: 'updateDepartment',
      userId: user.id,
      tenantId: user.tenantId,
      source: 'web-form',
      additionalData: { 
        departmentId,
        formData: Object.fromEntries(formData.entries()) 
      },
      severity: 'medium',
      tags: ['form-submission', 'department', 'update']
    });
    
    await trackFormError({
      userId: user.id,
      formType: 'department_update',
      errorMessage: errorMessage,
      entityType: 'department',
      entityId: departmentId,
      processingTimeMs: performance.now() - startTime,
      tenantId: user.tenantId,
      source: 'web-form'
    });
    
    await trackErrorEvent(error, {
      context: 'updateDepartment',
      userId: user.id,
      tenantId: user.tenantId,
      source: 'web-form',
      additionalData: { 
        departmentId,
        formData: Object.fromEntries(formData.entries()) 
      },
      severity: 'medium'
    });
    
    return { 
      success: false,
      error: `Failed to update department: ${errorMessage}`,
      code: 'UPDATE_ERROR',
      changes: [] 
    };
  }
});

// Delete department
export const deleteDepartment = withAuth(async ({ db, user }, departmentId: string) => {
  const startTime = performance.now();
  
  try {
    // Soft delete department
    await softDeleteDepartmentQuery(db, departmentId, user.id);
    
    // Track entity deleted
    await trackEntityDeleted({
      userId: user.id,
      entityType: 'department',
      entityId: departmentId,
      tenantId: user.tenantId,
      source: 'web-action'
    });
    
    // Revalidate path
    revalidatePath('/departments');
    
    return { success: true };
    
  } catch (error) {
    // Track error
    const errorMessage = captureError(error, {
      context: 'deleteDepartment',
      userId: user.id,
      tenantId: user.tenantId,
      source: 'web-action',
      additionalData: { departmentId },
      severity: 'medium',
      tags: ['entity-deletion', 'department']
    });
    
    await trackErrorEvent(error, {
      context: 'deleteDepartment',
      userId: user.id,
      tenantId: user.tenantId,
      source: 'web-action',
      additionalData: { departmentId },
      severity: 'medium'
    });
    
    return { 
      success: false,
      error: `Failed to delete department: ${errorMessage}`,
      code: 'DELETE_ERROR'
    };
  }
});
