// apps/app/app/(authenticated)/dashboard/actions.ts
import { getTenantDbClient } from '@/app/utils/tenant-db';
import { getAdvisoryCasesCount, getAllCases, getLitigationCasesCount } from '@repo/database/src/tenant-app/queries/cases-queries';
import { NextRequest } from 'next/server';

/**
 * Retrieves all cases for the current tenant.
 */
export async function getCases(request: NextRequest) {
  try {
    const tenantDb = await getTenantDbClient(request);
    const cases = await getAllCases(tenantDb);
    return { 
      status: 'success', 
      data: cases,
      message: 'Cases retrieved successfully' 
    };
  } catch (error) {
    console.error('Error fetching cases:', error);
    return { 
      status: 'error', 
      message: 'Failed to fetch cases' 
    };
  }
}

/**
 * Retrieves the count of active advisory cases.
 */
export async function getAdvisoryCasesKPI(request: NextRequest) {
  try {
    const tenantDb = await getTenantDbClient(request);
    const count = await getAdvisoryCasesCount(tenantDb);
    return { 
      status: 'success', 
      data: { count },
      message: 'Advisory cases count retrieved successfully' 
    };
  } catch (error) {
    console.error('Error in getAdvisoryCasesKPI:', error);
    return { 
      status: 'error', 
      message: 'Failed to get advisory cases count' 
    };
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