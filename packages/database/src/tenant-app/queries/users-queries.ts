import type { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { users } from '../schema/main/users-schema';
import { combinedSchema } from '../schema';
import { eq } from 'drizzle-orm';

export async function findUserByClerkId(
  tenantDb: NeonDatabase<typeof combinedSchema>,
  clerkId: string
) {
  const result = await tenantDb
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1)
    .execute();

  return result[0];
} 