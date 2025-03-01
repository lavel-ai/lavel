// apps/app/app/(authenticated)/features/departments/actions/get-departments.ts
'use server';

import { auth } from '@repo/auth/server';
import { getTenantDbClientUtil } from '@/app/utils/get-tenant-db-connection';
import { departments } from '@repo/database/src/tenant-app/schema/departments-schema';
import { desc, isNull } from 'drizzle-orm';
import { getInternalUserId } from '@/app/actions/users/users-actions';
import { unstable_cache } from 'next/cache';
import { getTenantIdentifier } from '@/app/utils/tenant-identifier';

export type Department = {
  id: string;
  name: string;
  description: string | null;
};

type GetDepartmentsResponse = {
  status: 'success' | 'error';
  data?: Department[];
  message?: string;
}

// Create a cached function for fetching departments
const getCachedDepartments = unstable_cache(
  async (tenantId: string): Promise<Department[]> => {
    // Get tenant database connection
    const db = await getTenantDbClientUtil();
    
    // Query departments (only non-deleted ones)
    const departmentsList = await db.query.departments.findMany({
      where: isNull(departments.deletedAt),
      orderBy: [desc(departments.createdAt)],
    });

    return departmentsList;
  },
  // Key for the cache
  ['departments'],
  // Cache options
  { tags: ['departments'], revalidate: 60 } // Cache for 60 seconds
);

export async function getDepartments(): Promise<GetDepartmentsResponse> {
  try {
    // Verify Clerk authentication
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return { status: 'error', message: 'Unauthorized' };
    }

    // Get internal user ID
    const internalUserId = await getInternalUserId();
    if (!internalUserId) {
      return { status: 'error', message: 'Usuario interno no encontrado' };
    }

    // Get tenant ID for cache key
    const tenantId = await getTenantIdentifier();
    if (!tenantId) {
      return { status: 'error', message: 'Invalid tenant' };
    }
    
    // Use the cached function
    const departmentsList = await getCachedDepartments(tenantId);

    return { status: 'success', data: departmentsList };
  } catch (error) {
    console.error('Error fetching departments:', error);
    return { status: 'error', message: 'Failed to fetch departments' };
  }
}