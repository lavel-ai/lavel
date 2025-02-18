'use server';

// apps/app/app/(authenticated)/dashboard/actions.ts
import { getTenantDbClientUtil } from '@/app/utils/get-tenant-db-connection';
import { getAdvisoryCasesCount, getLitigationCasesCount } from '@repo/database/src/tenant-app/queries/cases-queries';
import { revalidatePath } from 'next/cache';
import { cases } from '@repo/database/src/tenant-app/schema';
import { getInternalUserId } from '../users/user-actions';
import type { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { auth } from '@repo/auth/server';

export async function getLitigationCasesKPI() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        status: 'error',
        message: 'Unauthorized',
      };
    }

    const tenantDb = await getTenantDbClientUtil();
    const count = await getLitigationCasesCount(tenantDb);

    return {
      status: 'success',
      data: { count },
      message: 'Litigation cases count retrieved',
    };
  } catch (error: any) {
    console.error('Error in getLitigationCasesKPI:', error);
    return {
      status: 'error',
      message: 'Failed to get litigation cases count',
    };
  }
}

export async function getAdvisoryCasesKPI() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        status: 'error',
        message: 'Unauthorized',
      };
    }
    const tenantDb = await getTenantDbClientUtil();
    const count = await getAdvisoryCasesCount(tenantDb);
    return {
      status: 'success',
      data: { count },
      message: 'Advisory cases count retrieved successfully',
    };
  } catch (error) {
    console.error('Error in getAdvisoryCasesKPI:', error);
    return {
      status: 'error',
      message: 'Failed to get advisory cases count',
    };
  }
}

// Example: Fetch all cases for the tenant
export async function getAllCases(req: NextRequest) {
    const internalUserId = await getInternalUserId();
    if (!internalUserId) {
        throw new Error("User not authenticated or not found in tenant DB");
    }
  try {
    const tenantDb = await getTenantDbClientUtil();
    const allCases = await tenantDb.select().from(cases).where(eq(cases.leadAttorneyId, internalUserId));
    return allCases;
  } catch (error) {
    console.error("Error fetching cases:", error);
    return null; // Or throw an error, depending on your error handling
  }
}

// Example: Create a new case
export async function createCase(req: NextRequest, newCaseData: any) {
    const internalUserId = await getInternalUserId();
    if (!internalUserId) {
        throw new Error("User not authenticated or not found in tenant DB");
    }

    try {
        const tenantDb = await getTenantDbClientUtil();

        // TODO: Add validation and sanitization of newCaseData here

        // Set leadAttorneyId to the current user's ID if not provided
        const caseData = {
            ...newCaseData,
            leadAttorneyId: internalUserId,
        };

        const createdCase = await tenantDb.insert(cases).values(caseData).returning();
        revalidatePath("/");
        return createdCase[0];

    } catch (error) {
        console.error("Error creating case:", error);
        return null; // Or throw an error
    }
}

// Example: Update a case
export async function updateCase(req: NextRequest, caseId: number, updatedCaseData: any) {
    const internalUserId = await getInternalUserId();
    if (!internalUserId) {
        throw new Error("User not authenticated or not found in tenant DB");
    }

    try {
        const tenantDb = await getTenantDbClientUtil();

        // TODO: Add validation and sanitization of updatedCaseData here
        // TODO: Consider authorization checks here, e.g., is this user allowed to update this case?

        const updatedCase = await tenantDb.update(cases).set(updatedCaseData).where(eq(cases.id, caseId.toString())).returning();
        revalidatePath("/");
        return updatedCase[0];

    } catch (error) {
        console.error("Error updating case:", error);
        return null; // Or throw an error
    }
}

// Example: Delete a case
export async function deleteCase(req: NextRequest, caseId: number) {
    const internalUserId = await getInternalUserId();
    if (!internalUserId) {
        throw new Error("User not authenticated or not found in tenant DB");
    }

    try {
        const tenantDb = await getTenantDbClientUtil();

        // TODO: Consider authorization checks here, e.g., is this user allowed to delete this case?

        const deletedCase = await tenantDb.delete(cases).where(eq(cases.id, caseId.toString())).returning();
        revalidatePath("/");
        return deletedCase[0];

    } catch (error) {
        console.error("Error deleting case:", error);
        return null; // Or throw an error
    }
}