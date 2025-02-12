// apps/app/hooks/useCases.ts

import { useQuery } from '@tanstack/react-query';
import type { Case } from '@repo/database/src/tenant-app/schema/main/case-schema';

/**
 * fetchCases is a helper function that calls the API endpoint.
 * It sends a GET request to /api/cases, and returns the parsed JSON,
 * which is expected to be an array of Case objects.
 */
async function fetchCases(): Promise<Case[]> {
  const response = await fetch('/api/cases');
  if (!response.ok) {
    throw new Error('Failed to fetch cases');
  }
  return response.json();
}

/**
 * useCases is a custom hook that leverages React Query's useQuery hook.
 * It automatically handles caching, re-fetching, and error handling.
 *
 * - queryKey: A unique key (['cases']) identifying this query.
 * - queryFn: The function to fetch the data (fetchCases).
 */
export function useCases(): Promise<Case[]> {
  return fetchCases();
}
