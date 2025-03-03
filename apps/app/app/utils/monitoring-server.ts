// // app/utils/monitoring-server.ts
// import 'server-only';
// import { log } from '@repo/observability/log';
// import { trackServerEvent, EventCategory } from '@repo/analytics/events';
// import { captureError } from '@repo/observability/error';

// export const monitoring = {
//   logInfo: (message: string, data = {}) => {
//     log.info(message, data);
//   },
  
//   logError: (message: string, error: unknown, data = {}) => {
//     log.error(message, { error, ...data });
//     captureError(error, { message, ...data });
//   },
  
//   trackEvent: async (category: EventCategory, action: string, properties = {}, userId?: string) => {
//     if (!userId) return;
//     await trackServerEvent(category, action, properties, userId);
//   }
// };