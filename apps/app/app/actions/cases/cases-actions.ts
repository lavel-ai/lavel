// apps/app/app/(authenticated)/dashboard/actions.ts
import { getTenantDbClient } from '@/app/utils/tenant-db';
import { deleteCase, getAdvisoryCasesCount, getAllCases, getLitigationCasesCount } from '@repo/database/src/tenant-app/queries/cases-queries';
import { parseError } from '@repo/observability/error';
import { revalidatePath } from 'next/cache';
import { NextRequest } from 'next/server';

/**
 * Retrieves all cases for the current tenant.
 */
export async function getCases(request: NextRequest): Promise<{ status: string; message: string; data?: any }> {
  try {
    const tenantDb = await getTenantDbClient(request); //Pass the request
    const cases = await getAllCases(tenantDb);
    return { status: 'success', message: 'Cases retrieved successfully', data: cases };
  } catch (error) {
    console.error('Error in getCases:', error);
    return { status: 'error', message: 'Failed to fetch cases' };
  }
}

/**
 * Deletes a case for the current tenant.
 */
export async function deleteCaseAction(request: NextRequest, caseId: string): Promise<{ status: string; message: string }> {
  try {
    const tenantDb = await getTenantDbClient(request); //Pass the request

    await deleteCase(tenantDb, caseId);
    revalidatePath('/cases'); // Revalidate the cases page
    return { status: 'success', message: 'Case deleted successfully' };
  } catch (error) {
    const parsedError = parseError(error)
    return { status: 'error', message: parsedError };
  }
}

export async function getLitigationCasesKPI(request: NextRequest) {
  try {
    const tenantDb = await getTenantDbClient(request);
    const count = await getLitigationCasesCount(tenantDb);
    return { status: 'success', message: 'Litigation cases count retrieved', data: { count } };
  } catch (error) {
    console.error('Error in getLitigationCasesKPI:', error);
    return { status: 'error', message: 'Failed to get litigation cases count' };
  }
} 