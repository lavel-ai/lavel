// "use client";

// import { useQuery } from "@tanstack/react-query";
// import { getTodayAndOverdueTasks } from '@repo/database/src/tenant-app/queries/tasks-queries';
// import { getTenantDbClient } from '@/app/utils/tenant-db';
// // import type { NextRequest } from 'next/server'; // No longer needed

// interface Task {
//   id: string;
//   title: string;
//   description: string | null;
//   status: string;
//   priority: string;
//   dueDate: string | null;
//   assignedTo: string;  // This is a database UUID
//   assignedBy: string;  // This is a database UUID
//   caseId: string | null;
// }

// interface TasksResponse {
//   overdueTasks: Task[];
//   todayTasks: Task[];
//   totalOverdue: number;
//   totalToday: number;
// }

// interface ApiResponse<T> {
//   status: 'success' | 'error';
//   message: string;
//   data: T;
// }

// /**
//  * Hook to fetch today's and overdue tasks
//  * Handles auth and data fetching automatically
//  */
// export const useTasks = () => {
//   const {
//     internalUserId,
//     isLoading: isInternalUserLoading,
//     refetchInternalUser,
//     error: internalUserError,
//   };

//   const {
//     data,
//     isLoading,
//     error,
//     refetch,
//   } = useQuery({
//     queryKey: ['tasks', internalUserId],
//     queryFn: async () => {
//       if (!internalUserId) {
//         return [];
//       }
//       // Create the mock request object HERE:
//       const req = { headers: { get: (key: string) => {
//         if (key === 'host') {
//           return 'dummy-host'; // Or any non-null string
//         }
//         return null; // For other keys
//       }}} as any;

//       const tenantDb = await getTenantDbClient(req); // Now it should work
//       return getTodayAndOverdueTasks(tenantDb, internalUserId);
//     },
//     enabled: !!internalUserId && !isInternalUserLoading,
//     staleTime: Infinity,
//   });

//   const refetchAll = async () => {
//     await refetchInternalUser();
//     refetch();
//   };

//   return {
//     tasks: data,
//     isLoading: isLoading || isInternalUserLoading,
//     error: error || internalUserError,
//     refetch: refetchAll,
//   };
// };

// export function useTodayTasks() {
//   return useQuery<TasksResponse, Error>({
//     queryKey: ['today-tasks'],
//     queryFn: async () => {
//       const response = await fetch('/api/tasks/today');
//       if (!response.ok) {
//         throw new Error('Failed to fetch tasks');
//       }
//       const result: ApiResponse<TasksResponse> = await response.json();
//       if (result.status === 'error') {
//         throw new Error(result.message);
//       }
//       return result.data;
//     },
//     staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
//   });
// } 