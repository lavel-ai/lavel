'use server';

import type { NextRequest } from 'next/server';
import { getTenantDbClient } from '@/app/utils/tenant-db';
import {
  createCase as createCaseQuery,
  deleteCase as deleteCaseQuery,
  getAllCases,
  getCaseById,
  updateCase as updateCaseQuery,
} from '@repo/database/src/tenant-app/queries/cases-queries';
import { InsertCaseSchema, UpdateCaseSchema } from '@repo/database/src/tenant-app/schema/main/case-schema';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

/**
 * Retrieves all cases for the current tenant.
 * Expects that the tenant middleware has attached the tenantDb to the NextRequest.
 */
export async function getCases(request: NextRequest) {
  const tenantDb = await getTenantDbClient(request);
  const allCases = await getAllCases(tenantDb);
  console.log('All cases:', allCases);
  return allCases;
}

/**
 * Retrieves a single case by its ID.
 */
export async function getSingleCase(request: NextRequest, caseId: string) {
  const tenantDb = await getTenantDbClient(request);
  const singleCase = await getCaseById(tenantDb, caseId);
  console.log('Single case:', singleCase);
  return singleCase;
}

/**
 * Creates a new case using data from a submitted FormData.
 */
// export async function createCase(request: NextRequest, formData: FormData) {
//   const tenantDb = getTenantDbClient(request);

//   const rawData = {
//     title: formData.get('name'),
//     clientId: formData.get('clientId'),
//     description: formData.get('description'),
//     status: formData.get('status'),
//     type: 'advisory',
//     riskLevel: 'low',
//     startDate: new Date(),
//     leadAttorneyId: formData.get('leadAttorneyId') || '',
//     assignedTeamId: formData.get('assignedTeamId') || '',
//     lastActivityType: 'created',
//     lastActivityById: formData.get('leadAttorneyId') || '',
//     createdBy: formData.get('leadAttorneyId') || '',
//     updatedBy: formData.get('leadAttorneyId') || ''
//   };

//   try {
//     const validatedData = InsertCaseSchema.parse(rawData);
//     const newCase = await createCaseQuery(tenantDb, validatedData);
//     // Revalidate the /cases path to update any cached data
//     revalidatePath('/cases');
//     return newCase;
//   } catch (error) {
//     console.error("Error creating case:", error);
//     throw new Error('Failed to create case');
//   }
// }

/**
 * Updates an existing case.
 */
// export async function updateCase(request: NextRequest, caseId: string, formData: FormData) {
//   const tenantDb = getTenantDbClient(request);
  
//   const rawData = {
//     title: formData.get('name'),
//     description: formData.get('description'),
//     status: formData.get('status'),
//     updatedBy: formData.get('leadAttorneyId') || ''
//   };

//   try {
//     const validatedData = UpdateCaseSchema.parse(rawData);
//     await updateCaseQuery(tenantDb, caseId, validatedData);
//     // Revalidate relevant paths and redirect to the case detail page.
//     revalidatePath(`/cases/${caseId}`);
//     revalidatePath('/cases');
//     redirect(`/cases/${caseId}`);
//   } catch (error) {
//     console.error("Error updating case:", error);
//     throw new Error('Failed to update case');
//   }
// }

/**
 * Deletes an existing case.
 */
export async function deleteCase(request: NextRequest, caseId: string) {
  const tenantDb = await getTenantDbClient(request);
  await deleteCaseQuery(tenantDb, caseId);
  revalidatePath('/cases');
  redirect('/cases');
}
