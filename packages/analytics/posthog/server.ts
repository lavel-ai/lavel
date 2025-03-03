import 'server-only';
import { PostHog } from 'posthog-node';
import { keys } from '../keys';

/**
 * Server-side PostHog client
 * IMPORTANT: This module can ONLY be imported in server components or server actions
 * For client-side analytics, use the client.tsx module instead
 */
export const analytics = new PostHog(keys().NEXT_PUBLIC_POSTHOG_KEY, {
  host: keys().NEXT_PUBLIC_POSTHOG_HOST,

  // Don't batch events and flush immediately - we're running in a serverless environment
  flushAt: 1,
  flushInterval: 0,
});
