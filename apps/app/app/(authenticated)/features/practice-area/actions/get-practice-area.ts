'use server';

import { unstable_cache } from 'next/cache';
import { getTenantDbClientUtil } from '@/app/utils/get-tenant-db-connection';
import { eq, isNull, desc } from 'drizzle-orm';
import { lawBranches } from '@repo/database/src/tenant-app/schema/law-branches-schema';
import { ApiResponse, PracticeAreaOption } from './practice-area-actions';

const CACHE_TAG = 'practice-areas';

/**
 * Fetches all practice areas
 */
export const getPracticeAreas = unstable_cache(
  async (): Promise<ApiResponse<PracticeAreaOption[]>> => {
    try {
      const db = await getTenantDbClientUtil();
      const practiceAreas = await db.query.lawBranches.findMany({
        where: isNull(lawBranches.deletedAt),
        orderBy: [
          desc(lawBranches.active),
          lawBranches.name
        ],
      });

      return {
        status: 'success',
        data: practiceAreas.map(area => ({
          id: area.id,
          name: area.name,
          description: area.description || '',
          active: area.active || true,
          createdAt: area.createdAt,
          updatedAt: area.updatedAt,
          createdBy: area.createdBy,
          updatedBy: area.updatedBy,
        })),
      };
    } catch (error) {
      console.error('Error fetching practice areas:', error);
      return {
        status: 'error',
        message: 'Error al obtener las áreas de práctica',
        error: {
          code: 'FETCH_ERROR',
          details: error,
        },
      };
    }
  },
  ['practice-areas'],
  {
    tags: [CACHE_TAG],
    revalidate: 3600, // Cache for 1 hour
  }
);

/**
 * Fetches a practice area by its ID
 */
export const getPracticeAreaById = unstable_cache(
  async (id: number): Promise<ApiResponse<PracticeAreaOption>> => {
    try {
      if (!id) {
        return {
          status: 'error',
          message: 'ID de área de práctica no proporcionado',
          error: {
            code: 'INVALID_PARAMS',
          },
        };
      }

      const db = await getTenantDbClientUtil();
      const practiceArea = await db.query.lawBranches.findFirst({
        where: eq(lawBranches.id, id),
      });

      if (!practiceArea) {
        return {
          status: 'error',
          message: 'Área de práctica no encontrada',
          error: {
            code: 'NOT_FOUND',
          },
        };
      }

      return {
        status: 'success',
        data: practiceArea,
      };
    } catch (error) {
      console.error('Error fetching practice area:', error);
      return {
        status: 'error',
        message: 'Error al obtener el área de práctica',
        error: {
          code: 'FETCH_ERROR',
          details: error,
        },
      };
    }
  },
  ['practice-area-by-id'],
  {
    tags: [CACHE_TAG],
    revalidate: 3600, // Cache for 1 hour
  }
);
