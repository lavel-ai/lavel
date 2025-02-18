import { eq, sql, count, and } from 'drizzle-orm';
import { type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { cases } from '../schema';
import { TenantDatabase } from '../tenant-connection-db';

export async function getLitigationCasesCount(
  tenantDb: TenantDatabase,
): Promise<number> {
  const result = await tenantDb
    .select({ count: sql<number>`count(*)` })
    .from(cases)
    .where(
      and(
        eq(cases.type, 'litigation'),
        eq(cases.isActive, true),
      ),
    )
    .execute();

  return result[0].count;
}

export async function getAdvisoryCasesCount(
  tenantDb: TenantDatabase,
): Promise<number> {
  const result = await tenantDb
    .select({ count: sql<number>`count(*)` })
    .from(cases)
    .where(
      and(
        eq(cases.type, 'advisory'),
        eq(cases.isActive, true),
      ),
    )
    .execute();

  return result[0].count;
}
