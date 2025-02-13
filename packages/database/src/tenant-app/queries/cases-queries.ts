// packages/database/src/tenant-app/queries/cases-queries.ts
import { cases, Case, CaseInsert, combinedSchema } from '../schema';
import { eq, and, sql } from 'drizzle-orm';
import type { NeonDatabase } from 'drizzle-orm/neon-serverless';

/**
 * Retrieves all cases from the tenant database.
 */
export async function getAllCases(
  tenantDb: NeonDatabase<typeof combinedSchema>
): Promise<Case[]> {
  return await tenantDb.select().from(cases).execute();
}

/**
 * Retrieves a single case by its ID.
 */
export async function getCaseById(
  tenantDb: NeonDatabase<typeof combinedSchema>,
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
  tenantDb: NeonDatabase<typeof combinedSchema>,
  newCase: CaseInsert
): Promise<Case> {
  const insertedCases = await tenantDb.insert(cases).values(newCase).returning().execute();
  return insertedCases[0];
}

/**
 * Updates an existing case.
 */
export async function updateCase(
  tenantDb: NeonDatabase<typeof combinedSchema>,
  caseId: string,
  updatedCase: Partial<CaseInsert>
): Promise<void> {
  await tenantDb.update(cases).set(updatedCase).where(eq(cases.id, caseId)).execute();
}

/**
 * Deletes a case from the tenant database.
 */
export async function deleteCase(
  tenantDb: NeonDatabase<typeof combinedSchema>,
  caseId: string
): Promise<void> {
  await tenantDb.delete(cases).where(eq(cases.id, caseId)).execute();
}

export async function getAdvisoryCasesCount(
  tenantDb: NeonDatabase<typeof combinedSchema>
): Promise<number> {
  const result = await tenantDb
    .select({ count: sql<number>`count(*)` })
    .from(cases)
    .where(
      and(
        eq(cases.type, 'advisory'),
        eq(cases.isActive, true)
      )
    )
    .execute();
  
  return result[0].count;
}

export async function getLitigationCasesCount(
  tenantDb: NeonDatabase<typeof combinedSchema>
): Promise<number> {
  const result = await tenantDb
    .select({ count: sql<number>`count(*)` })
    .from(cases)
    .where(
      and(
        eq(cases.type, 'litigation'),
        eq(cases.isActive, true)
      )
    )
    .execute();
  
  return result[0].count;
}


