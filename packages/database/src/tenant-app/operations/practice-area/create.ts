import { PracticeArea } from '@repo/schema/src/entities/practice-area';
import { lawBranches } from '../../schema/law-branches-schema';
import type { TenantDatabase } from '../../tenant-connection-db';

/**
 * Creates a new practice area in the database
 * 
 * @param db Typed database client
 * @param data Practice area data
 * @param user Current user
 * @returns The created practice area
 */
export async function createPracticeArea(
  db: TenantDatabase,
  data: PracticeArea,
  user: { id: string }
) {
  // Insert the practice area
  const [newPracticeArea] = await db.insert(lawBranches)
    .values({
      name: data.name,
      description: data.description || null,
      active: data.active,
      createdBy: user.id,
      updatedBy: user.id,
    })
    .returning();

  return newPracticeArea;
}