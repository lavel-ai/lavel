// packages/analytics/events.ts
import 'server-only';
import { analytics } from './posthog/server';
import { log } from '@repo/observability/log';

// Standard event categories
export enum EventCategory {
  PAGE = 'page',
  FORM = 'form',
  ENTITY = 'entity',
  ACTION = 'action',
  ERROR = 'error',
  PERFORMANCE = 'performance'
}

// Server-side event tracking with standard properties
export async function trackServerEvent(
  category: EventCategory,
  action: string,
  properties: Record<string, any> = {},
  userId?: string
) {
  if (!userId) return;
  
  try {
    const timestamp = Date.now();
    const eventName = `${category}_${action}`;
    
    await analytics.capture({
      distinctId: userId,
      event: eventName,
      properties: {
        timestamp,
        ...properties
      }
    });
    
    // Log for observability
    log.info(`Analytics event tracked: ${eventName}`, {
      category,
      action,
      userId,
      properties
    });
  } catch (error) {
    // Silent fail for analytics - should not interrupt main flow
    log.error('Analytics tracking error:', { error });
  }
}