// // app/hooks/use-monitoring.ts
// 'use client';

// import { useAnalytics } from '@repo/analytics/posthog/client';
// import { captureError } from '@repo/observability/error';

// export function useMonitoring() {
//   const analytics = useAnalytics();
  
//   return {
//     trackEvent: (eventName: string, properties = {}) => {
//       try {
//         analytics.capture(eventName, properties);
//       } catch (error) {
//         console.error('Failed to track event:', error);
//       }
//     },
    
//     trackError: (error: unknown, context = {}) => {
//       captureError(error, context);
      
//       try {
//         analytics.capture('error_occurred', {
//           error_message: error instanceof Error ? error.message : String(error),
//           ...context
//         });
//       } catch (analyticsError) {
//         console.error('Failed to track error in analytics:', analyticsError);
//       }
//     }
//   };
// }