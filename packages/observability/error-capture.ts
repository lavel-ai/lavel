import { captureException } from '@sentry/nextjs';
import { log } from './log';

/**
 * Isomorphic error capture function that works in both client and server environments
 * This doesn't use the server-only PostHog analytics directly
 */
export const captureErrorBase = async (error: unknown, context: Record<string, any> = {}): Promise<string> => {
  let message = 'An error occurred';

  if (error instanceof Error) {
    message = error.message;
  } else if (error && typeof error === 'object' && 'message' in error) {
    message = error.message as string;
  } else {
    message = String(error);
  }

  try {
    // Track in Sentry (works in both client and server)
    captureException(error, { extra: context });
    
    // Log the error
    log.error(`Error captured: ${message}`, { ...context, error });
  } catch (newError) {
    console.error('Error capturing error:', newError);
  }

  return message;
}; 