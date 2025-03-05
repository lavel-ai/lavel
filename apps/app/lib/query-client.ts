// // app/lib/query-client.ts
// import { QueryClient } from '@tanstack/react-query';
// import { parseError } from '@repo/observability/error';
// import { useAnalytics } from '@repo/analytics';

// // Function to track query errors
// export const trackQueryError = (error: unknown, queryKey: unknown[]) => {
//   parseError(error);
  
//     context: 'reactQuery',
//     queryKey: JSON.stringify(queryKey)
//   });
  
//   // Try to track in analytics if available
//   try {
//     const posthog = useAnalytics();
//     posthog.capture('query_error', {
//       query_key: Array.isArray(queryKey) ? queryKey[0] : String(queryKey),
//       error_message: error instanceof Error ? error.message : String(error)
//     });
//   } catch (analyticsError) {
//     // Silent fail
//   }
// };

// // Function to track query success
// export const trackQuerySuccess = (queryKey: unknown[]) => {
//   try {
//     const posthog = useAnalytics();
//     posthog.capture('query_success', {
//       query_key: Array.isArray(queryKey) ? queryKey[0] : String(queryKey)
//     });
//   } catch (analyticsError) {
//     // Silent fail
//   }
// };

// // // Query client configuration with observability
// // export const queryClient = new QueryClient({
// //   defaultOptions: {
// //     queries: {
// //       retry: 1,
// //       onError: (error, query) => {
// //         trackQueryError(error, query.queryKey);
// //       },
// //       onSuccess: (data, query) => {
// //         trackQuerySuccess(query.queryKey);
// //       }
// //     },
// //     mutations: {
// //       onError: (error, variables, context, mutation) => {
// //         trackQueryError(error, mutation.mutationKey || ['mutation']);
// //       }
// //     }
// //   }
// // });