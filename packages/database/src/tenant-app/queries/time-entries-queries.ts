import { sql } from 'drizzle-orm';
import type { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { timeEntries } from '../schema/main/time-entries-schema';
import { combinedSchema } from '../schema';
import { and, eq, gte, lte } from 'drizzle-orm';

export async function getWeeklyTimeEntriesForUser(
  tenantDb: NeonDatabase<typeof combinedSchema>,
  userId: string
): Promise<{ totalHours: number }> {
  const result = await tenantDb
    .select({
      totalHours: sql<number>`
        EXTRACT(EPOCH FROM sum(${timeEntries.timeSpent}))::float / 3600
      `
    })
    .from(timeEntries)
    .where(
      and(
        eq(timeEntries.userId, userId),
        gte(timeEntries.createdAt, sql`date_trunc('week', CURRENT_TIMESTAMP)`),
        lte(timeEntries.createdAt, sql`CURRENT_TIMESTAMP`)
      )
    )
    .execute();

  return {
    totalHours: result[0]?.totalHours || 0
  };
} 