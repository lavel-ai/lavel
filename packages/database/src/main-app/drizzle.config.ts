import * as dotenv from 'dotenv';
import { defineConfig } from 'drizzle-kit';
import { keys } from '../../keys';

// Load .env file
dotenv.config({ path: '../../.env' });

const databaseUrl = keys().DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required');
}

export default defineConfig({
  schema: './schema/index.ts', // Updated path
  out: './.drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
  },
});
