'use server';

import { getTenantDbClient } from '@/app/utils/tenant-db';
import { getWeeklyTimeEntriesForUser } from '@repo/database/src/tenant-app/queries/time-entries-queries';
import type { NextRequest } from 'next/server';

export async function getWeeklyTimeEntriesKPI(request: NextRequest, userId: string) {
  try {
    const tenantDb = await getTenantDbClient(request);
    const data = await getWeeklyTimeEntriesForUser(tenantDb, userId);
    
    return { 
      status: 'success', 
      message: 'Weekly time entries retrieved', 
      data 
    };
  } catch (error) {
    console.error('Error in getWeeklyTimeEntriesKPI:', error);
    return { 
      status: 'error', 
      message: 'Failed to get weekly time entries' 
    };
  }
} 