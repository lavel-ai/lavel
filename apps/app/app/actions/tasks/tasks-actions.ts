'use server';

import { getTenantDbClientUtil } from '../../utils/tenant-db';
import { getTodayAndOverdueTasks } from '@repo/database/src/tenant-app/queries/tasks-queries';
import { findUserByClerkId } from '@repo/database/src/tenant-app/queries/users-queries';
import type { NextRequest } from 'next/server';
import { auth } from '@repo/auth/server';
import { revalidatePath } from 'next/cache';

/**
 * Get tasks for today's KPI card
 * Handles translation from Clerk ID to database UUID
 */
export async function getTodayAndOverdueTasksKPI(request: NextRequest, clerkUserId: string) {
  try {
    const tenantDb = await getTenantDbClientUtil();
    
    // First, get the user's database ID
    const user = await findUserByClerkId(tenantDb, clerkUserId);
    if (!user) {
      return { 
        status: 'error', 
        message: 'User not found in tenant database' 
      };
    }

    // Then get their tasks using the database UUID
    const tasks = await getTodayAndOverdueTasks(tenantDb, user.id);
    
    return { 
      status: 'success', 
      message: 'Tasks retrieved successfully', 
      data: {
        ...tasks,
        totalOverdue: tasks.overdueTasks.length,
        totalToday: tasks.todayTasks.length,
      }
    };
  } catch (error) {
    console.error('Error in getTodayAndOverdueTasksKPI:', error);
    return { 
      status: 'error', 
      message: 'Failed to get tasks' 
    };
  }
}

export async function createTaskAction(taskData: any, req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return { error: 'Unauthorized' };
  }

  const tenantDb = await getTenantDbClientUtil();
  const user = await findUserByClerkId(tenantDb, clerkId);

  if (!user) {
    return { error: 'User not found' };
  }

  const internalUserId = user.id;

  try {
    const newTask = await createTask(tenantDb, {
      ...taskData,
      userId: internalUserId,
    });
    revalidatePath('/tasks');
    return newTask;
  } catch (error) {
    return { error: 'Failed to create task' };
  }
}

// Similar modifications for updateTaskAction and deleteTaskAction, using internalUserId and req 