"use client";

import { useQuery } from '@tanstack/react-query';
import type { Case } from '@repo/database/src/tenant-app/schema/main/case-schema';

interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data: T;
}

/**
 * Hook to fetch all cases
 */
export function useCases() {
  return useQuery<Case[], Error>({
    queryKey: ['cases'],
    queryFn: async () => {
      const response = await fetch('/api/cases');
      if (!response.ok) {
        throw new Error('Failed to fetch cases');
      }
      const data: ApiResponse<Case[]> = await response.json();
      if (data.status === 'error') throw new Error(data.message);
      return data.data;
    }
  });
}

/**
 * Hook to fetch the count of active advisory cases
 */
export function useAdvisoryCasesCount() {
  return useQuery<number, Error>({
    queryKey: ['advisory-cases-count'],
    queryFn: async () => {
      const response = await fetch('/api/cases/advisory');
      if (!response.ok) {
        throw new Error('Failed to fetch advisory cases count');
      }
      const data: ApiResponse<{ count: number }> = await response.json();
      if (data.status === 'error') throw new Error(data.message);
      return data.data.count;
    }
  });
} 