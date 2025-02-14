import type { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { tasks } from '../schema/main/tasks-schema';
import { combinedSchema } from '../schema';
import { and, eq, isNull, lt, gte, lte, or } from 'drizzle-orm';

/**
 * Get today's and overdue tasks for a user
 * @param tenantDb - Tenant database connection
 * @param dbUserId - User's UUID from the database (not Clerk ID)
 */
export async function getTodayAndOverdueTasks(
  tenantDb: NeonDatabase<typeof combinedSchema>,
  dbUserId: string
) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  const result = await tenantDb
    .select({
      id: tasks.id,
      title: tasks.title,
      description: tasks.description,
      status: tasks.status,
      priority: tasks.priority,
      dueDate: tasks.dueDate,
      assignedTo: tasks.assignedTo,
      assignedBy: tasks.assignedBy,
      caseId: tasks.caseId,
    })
    .from(tasks)
    .where(
      and(
        eq(tasks.assignedTo, dbUserId), // Using database UUID
        eq(tasks.status, 'pending'),
        or(
          // Overdue tasks (due date is before today)
          lt(tasks.dueDate, startOfDay),
          // Today's tasks
          and(
            gte(tasks.dueDate, startOfDay),
            lte(tasks.dueDate, endOfDay)
          )
        )
      )
    )
    .orderBy(tasks.dueDate)
    .execute();

  // Separate overdue and today's tasks
  const overdueTasks = result.filter(task => 
    task.dueDate && new Date(task.dueDate) < startOfDay
  );

  const todayTasks = result.filter(task =>
    task.dueDate && 
    new Date(task.dueDate) >= startOfDay && 
    new Date(task.dueDate) <= endOfDay
  );

  return {
    overdueTasks,
    todayTasks,
    totalOverdue: overdueTasks.length,
    totalToday: todayTasks.length,
  };
} 