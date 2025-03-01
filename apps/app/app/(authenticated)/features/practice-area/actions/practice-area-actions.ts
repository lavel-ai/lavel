'use server';

import { getTenantDbClientUtil } from '@/app/utils/get-tenant-db-connection';
import { lawBranches } from '@repo/database/src/tenant-app/schema/law-branches-schema';
import { asc } from 'drizzle-orm';

/**
 * Represents a practice area option that can be selected in the UI
 */
export interface PracticeAreaOption {
  id: number;
  name: string;
}

/**
 * Standard API response format
 */
export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

/**
 * Fetches all practice areas (law branches) from the database
 * @returns A list of practice areas with their IDs and names
 */
export async function getPracticeAreas(): Promise<ApiResponse<PracticeAreaOption[]>> {
  try {
    const db = await getTenantDbClientUtil();
    const areas = await db.query.lawBranches.findMany({
      columns: {
        id: true,
        name: true,
      },
      orderBy: [asc(lawBranches.name)],
    });

    return {
      status: 'success',
      data: areas,
    };
  } catch (error) {
    console.error('Error fetching practice areas:', error);
    return {
      status: 'error',
      message: 'Error fetching practice areas',
    };
  }
} 