import { eq, desc, and, isNull } from 'drizzle-orm';
import { departments } from '../schema/departments-schema';
import { TenantDatabase } from '../tenant-connection-db';

// Get all departments (excluding soft deleted ones)
export async function getDepartmentsQuery(db: TenantDatabase) {
  return db.query.departments.findMany({
    where: isNull(departments.deletedAt),
    orderBy: [desc(departments.createdAt)]
  });
}

// Get department by ID
export async function getDepartmentQuery(db: TenantDatabase, id: string) {
  return db.query.departments.findFirst({
    where: and(
      eq(departments.id, id),
      isNull(departments.deletedAt)
    )
  });
}

// Insert department
export async function insertDepartmentQuery(db: TenantDatabase, data: {
  name: string;
  description?: string;
  createdBy: string;
}) {
  const insertResult = await db.insert(departments).values({
    name: data.name,
    description: data.description,
    createdBy: data.createdBy,
    updatedBy: data.createdBy,
  }).returning();
  
  return insertResult[0];
}

// Update department
export async function updateDepartmentQuery(db: TenantDatabase, id: string, data: {
  name?: string;
  description?: string;
  updatedBy: string;
}) {
  const updateResult = await db.update(departments)
    .set({
      ...data,
      updatedAt: new Date()
    })
    .where(eq(departments.id, id))
    .returning();
  
  return updateResult[0];
}

// Soft delete department
export async function softDeleteDepartmentQuery(db: TenantDatabase, id: string, userId: string) {
  const deleteResult = await db.update(departments)
    .set({
      deletedAt: new Date(),
      updatedBy: userId,
      updatedAt: new Date()
    })
    .where(eq(departments.id, id))
    .returning();
  
  return deleteResult[0];
}
