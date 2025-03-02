import { lawBranches, LawBranch } from '../schema/law-branches-schema';
import { asc, eq, isNull, and, ne } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { TenantDatabase } from '../tenant-connection-db';

// Type for practice area input data
export interface PracticeAreaInput {
  name: string;
  description?: string | null;
  active?: boolean;
}

/**
 * Get all practice areas from the database
 * @param db The tenant database client
 * @returns Array of practice areas
 */
export async function getPracticeAreas(db: TenantDatabase): Promise<LawBranch[]> {
  return db.query.lawBranches.findMany({
    orderBy: (lawBranches, { asc }) => [asc(lawBranches.name)],
    where: (lawBranches, { isNull }) => isNull(lawBranches.deletedAt)
  });
}

/**
 * Get a single practice area by ID
 * @param db The tenant database client
 * @param id The practice area ID
 * @returns The practice area or null if not found
 */
export async function getPracticeAreaById(db: TenantDatabase, id: number): Promise<LawBranch | undefined> {
  return db.query.lawBranches.findFirst({
    where: eq(lawBranches.id, id)
  });
}

/**
 * Create a new practice area
 * @param db The tenant database client
 * @param data The practice area data
 * @param userId The user ID creating the practice area
 * @returns The created practice area
 */
export async function createPracticeArea(
  db: TenantDatabase, 
  data: PracticeAreaInput, 
  userId: string
): Promise<LawBranch> {
  const [created] = await db.insert(lawBranches)
    .values({
      name: data.name,
      description: data.description,
      active: data.active ?? true,
      createdBy: userId,
      updatedBy: userId,
    })
    .returning();
  
  return created;
}

/**
 * Update an existing practice area
 * @param db The tenant database client
 * @param id The practice area ID
 * @param data The updated practice area data
 * @param userId The user ID updating the practice area
 * @returns The updated practice area
 */
export async function updatePracticeArea(
  db: TenantDatabase, 
  id: number, 
  data: PracticeAreaInput, 
  userId: string
): Promise<LawBranch> {
  const [updated] = await db.update(lawBranches)
    .set({
      name: data.name,
      description: data.description,
      active: data.active,
      updatedAt: new Date().toISOString(),
      updatedBy: userId,
    })
    .where(eq(lawBranches.id, id))
    .returning();
  
  return updated;
}

/**
 * Delete a practice area
 * @param db The tenant database client 
 * @param id The practice area ID
 * @param userId The user ID deleting the practice area
 * @returns The deleted practice area
 */
export async function deletePracticeArea(
  db: TenantDatabase, 
  id: number, 
  userId: string
): Promise<LawBranch> {
  const [deleted] = await db.update(lawBranches)
    .set({
      deletedAt: new Date().toISOString(),
      deletedBy: userId,
    })
    .where(eq(lawBranches.id, id))
    .returning();
  
  return deleted;
}

/**
 * Check if a practice area with the given name exists
 * @param db The tenant database client
 * @param name The practice area name
 * @param excludeId Optional ID to exclude from the check (for updates)
 * @param forceFresh Whether to force a fresh database query bypassing any cache
 * @returns True if a practice area with the name exists
 */
export async function practiceAreaExistsByName(
  db: TenantDatabase, 
  name: string, 
  excludeId: number | null = null,
  forceFresh: boolean = false
): Promise<boolean> {
  // If forceFresh is true, we'll use a direct SQL query to bypass any ORM-level caching
  if (forceFresh) {
    try {
      if (excludeId !== null) {
        // With excludeId
        const result = await db.execute(
          sql`SELECT EXISTS(SELECT 1 FROM "law_branches" WHERE "name" = ${name} AND "deleted_at" IS NULL AND "id" != ${excludeId}) AS "exists"`
        );
        return result.rows[0]?.exists === true;
      } else {
        // Without excludeId
        const result = await db.execute(
          sql`SELECT EXISTS(SELECT 1 FROM "law_branches" WHERE "name" = ${name} AND "deleted_at" IS NULL) AS "exists"`
        );
        return result.rows[0]?.exists === true;
      }
    } catch (error) {
      console.error("Error in direct SQL check for practice area existence:", error);
      // Fall back to ORM query
    }
  }
  
  // Standard ORM query (used either as primary method or fallback)
  const query = db.query.lawBranches.findFirst({
    where: (lawBranches, { and, eq, ne, isNull }) => {
      const conditions = [
        eq(lawBranches.name, name),
        isNull(lawBranches.deletedAt)
      ];
      
      if (excludeId !== null) {
        conditions.push(ne(lawBranches.id, excludeId));
      }
      
      return and(...conditions);
    }
  });
  
  const result = await query;
  return result !== null;
}

/**
 * Execute direct SQL query for debugging purposes
 * @param db The tenant database client
 * @returns Raw query result
 */
export async function executeRawPracticeAreaQuery(db: TenantDatabase) {
  try {
    // Note: Using snake_case for the table name (law_branches), not camelCase (lawBranches)
    return await db.execute(sql`SELECT * FROM "law_branches" ORDER BY "name" LIMIT 5`);
  } catch (error) {
    console.error("Raw SQL query error:", error);
    throw error;
  }
} 