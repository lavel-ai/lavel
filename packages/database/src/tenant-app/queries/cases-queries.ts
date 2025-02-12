// packages/database/src/tenant-app/queries/cases-queries.ts
import { cases, Case, CaseInsert, combinedSchema } from '../schema';
import { eq } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

/**
 * Retrieves all cases from the tenant database.
 */
export async function getAllCases(
  tenantDb: PostgresJsDatabase<typeof combinedSchema>
): Promise<Case[]> {
  return await tenantDb.select().from(cases).execute();
}

/**
 * Retrieves a single case by its ID.
 */
export async function getCaseById(
  tenantDb: PostgresJsDatabase<typeof combinedSchema>,
  caseId: string
): Promise<Case | undefined> {
  return await tenantDb
    .select()
    .from(cases)
    .where(eq(cases.id, caseId))
    .limit(1)
    .execute()
    .then(rows => rows[0]);
}

/**
 * Inserts a new case into the tenant database.
 */
export async function createCase(
  tenantDb: PostgresJsDatabase<typeof combinedSchema>,
  newCase: CaseInsert
): Promise<Case> {
  const insertedCases = await tenantDb.insert(cases).values(newCase).returning().execute();
  return insertedCases[0];
}

/**
 * Updates an existing case.
 */
export async function updateCase(
  tenantDb: PostgresJsDatabase<typeof combinedSchema>,
  caseId: string,
  updatedCase: Partial<CaseInsert>
): Promise<void> {
  await tenantDb.update(cases).set(updatedCase).where(eq(cases.id, caseId)).execute();
}

/**
 * Deletes a case from the tenant database.
 */
export async function deleteCase(
  tenantDb: PostgresJsDatabase<typeof combinedSchema>,
  caseId: string
): Promise<void> {
  await tenantDb.delete(cases).where(eq(cases.id, caseId)).execute();
}


