import { createApiClient } from '@neondatabase/api-client';
import { keys } from '../../keys';

const NEON_API_KEY = keys().NEON_API_KEY;

if (!NEON_API_KEY) {
  throw new Error('NEON_API_KEY is not set in environment variables');
}

export const neonApiClient = createApiClient({
  apiKey: NEON_API_KEY,
});
