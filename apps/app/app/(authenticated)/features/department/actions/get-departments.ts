// apps/app/app/(authenticated)/features/departments/actions/get-departments.ts
'use server';

import { auth } from '@repo/auth/server';
import { getTenantDbClientUtil } from '@/app/utils/get-tenant-db-connection';
import { departments } from '@repo/database/src/tenant-app/schema/departments-schema';
import { desc, isNull } from 'drizzle-orm';
import { getInternalUserId } from '@/app/actions/users/users-actions';

export type Department = {
  id: string;
  name: string;
  description: string | null;
};

export async function getDepartments(): Promise<{ status: string; data?: Department[]; message?: string }> {
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

    // Get tenant database connection
    const db = await getTenantDbClientUtil();
    
    // Query departments (only non-deleted ones)
    const departmentsList = await db.query.departments.findMany({
      where: isNull(departments.deletedAt),
      orderBy: [desc(departments.createdAt)],
    });

    return { status: 'success', data: departmentsList };
  } catch (error) {
    console.error('Error fetching departments:', error);
    return { status: 'error', message: 'Failed to fetch departments' };
  }
}