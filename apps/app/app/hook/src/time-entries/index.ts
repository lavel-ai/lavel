"use client";

import { useQuery } from "@tanstack/react-query";

export function useWeeklyTimeEntries() {
  return useQuery({
    queryKey: ['weekly-time-entries'],
    queryFn: async () => {
      const response = await fetch('/api/time-entries/weekly');
      if (!response.ok) {
        throw new Error('Failed to fetch weekly time entries');
      }
      const data = await response.json();
      if (data.status === 'error') throw new Error(data.message);
      return data.data;
    }
  });
} 