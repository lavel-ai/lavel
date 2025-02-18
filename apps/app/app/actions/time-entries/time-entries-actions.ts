'use server';

import { getTenantDbClientUtil } from '@/app/utils/get-tenant-db-connection';
import { getWeeklyTimeEntriesForUser } from '@repo/database/src/tenant-app/queries/time-entries-queries';
import type { NextRequest } from 'next/server';

export async function getWeeklyTimeEntriesKPI(request: NextRequest, userId: string) {
  try {
    const tenantDb = await getTenantDbClientUtil();
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